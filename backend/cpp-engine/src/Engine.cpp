#include "Engine.h"
#include "TrafficSim.h"
#include <algorithm>
#include <iostream>

namespace sbs {

    Engine::Engine() {
        reset();
    }

    void Engine::reset() {
        current_state = GameState();
    }

    GameState Engine::getState() const {
        return current_state;
    }

    bool Engine::requiresDigitalPayment(const std::string& action) const {
        std::string lower_action = action;
        std::transform(lower_action.begin(), lower_action.end(), lower_action.begin(), ::tolower);
        return (lower_action.find("upi") != std::string::npos || 
                lower_action.find("uber") != std::string::npos || 
                lower_action.find("ola") != std::string::npos || 
                lower_action.find("rapido") != std::string::npos ||
                lower_action.find("namma yatri") != std::string::npos);
    }

    nlohmann::json Engine::processLLMProposal(const LLMProposal& proposal, const std::string& user_action) {
        if (current_state.game_over) {
            return current_state.toJson();
        }

        // 1. Battery & Payment Validation (Rule 5)
        if (current_state.battery <= 0 && requiresDigitalPayment(user_action)) {
            current_state.elapsed_time_minutes += 5; // Wasted time trying to use a dead phone
            current_state.termination_reason = "You tried to use your phone, but it's dead. You couldn't book the ride or use UPI.";
            return current_state.toJson();
        }

        // 2. Enforce Location (Rule 6: No teleportation)
        std::string normalized_dest = TrafficSim::normalizeLocation(proposal.new_location);
        if (!normalized_dest.empty() && normalized_dest != current_state.current_location) {
            if (!TrafficSim::isValidRoute(current_state.current_location, normalized_dest)) {
                // Reject teleportation. Force them to stay put and lose time.
                current_state.elapsed_time_minutes += 10;
                current_state.termination_reason = "Engine Override: You cannot teleport from " + current_state.current_location + " to " + normalized_dest + ".";
                checkWinLossConditions();
                return current_state.toJson();
            } else {
                current_state.current_location = normalized_dest;
            }
        }

        // 3. Enforce Time (Rule 2 & 3: Time only moves forward, min 5 mins)
        int time_cost = std::max(5, proposal.suggested_time_minutes_cost); // At least 5 mins per action
        current_state.elapsed_time_minutes += time_cost;

        // 4. Enforce Finances (Rule 4: Cash cannot be negative)
        if (proposal.suggested_cash_cost > current_state.cash) {
            current_state.cash = 0; // Drain remaining cash
        } else {
            current_state.cash -= std::max(0, proposal.suggested_cash_cost);
        }

        // 5. Enforce Battery 
        current_state.battery -= std::max(0, proposal.suggested_battery_cost);
        if (current_state.battery < 0) current_state.battery = 0;

        // 6. Enforce Inventory
        for (const auto& item : proposal.inventory_remove) {
            auto it = std::find(current_state.inventory.begin(), current_state.inventory.end(), item);
            if (it != current_state.inventory.end()) {
                current_state.inventory.erase(it);
            }
        }
        for (const auto& item : proposal.inventory_add) {
            if (std::find(current_state.inventory.begin(), current_state.inventory.end(), item) == current_state.inventory.end()) {
                current_state.inventory.push_back(item);
            }
        }

        // 7. Win / Loss Validation
        checkWinLossConditions();

        // If the LLM declared game over in its proposal, respect it IF it makes sense, 
        // but Engine has final say if it missed a condition.
        if (proposal.game_over && !current_state.game_over) {
            current_state.game_over = true;
            current_state.victory = proposal.victory;
            current_state.termination_reason = proposal.reason;
        }

        return current_state.toJson();
    }

    void Engine::checkWinLossConditions() {
        if (current_state.elapsed_time_minutes >= FLIGHT_BOARDING_CLOSE_MINUTES) {
            current_state.game_over = true;
            current_state.victory = false;
            current_state.termination_reason = "It's past 9:10 PM. Boarding for your flight has closed. You missed it.";
        } else if (current_state.current_location == "Bengaluru International Airport") {
            current_state.game_over = true;
            current_state.victory = true;
            current_state.termination_reason = "You made it to the airport before boarding closed! You survived Silk Board.";
        }
    }

} // namespace sbs