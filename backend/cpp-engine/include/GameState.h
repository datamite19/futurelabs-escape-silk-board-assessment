#pragma once
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace sbs { // Silk Board Survival namespace

    // Core rules defined as constants
    constexpr int START_TIME_MINUTES = 0; // 7:00 PM
    constexpr int FLIGHT_BOARDING_CLOSE_MINUTES = 130; // 9:10 PM
    constexpr int START_CASH = 1000; // INR
    constexpr int START_BATTERY = 100; // Percentage

    struct GameState {
        int elapsed_time_minutes = START_TIME_MINUTES; 
        int cash = START_CASH;
        int battery = START_BATTERY;
        std::string current_location = "Silk Board Junction";
        std::vector<std::string> inventory;
        
        bool game_over = false;
        bool victory = false;
        std::string termination_reason = "";

        // Serialization
        nlohmann::json toJson() const {
            return {
                {"elapsed_time_minutes", elapsed_time_minutes},
                {"cash", cash},
                {"battery", battery},
                {"current_location", current_location},
                {"inventory", inventory},
                {"game_over", game_over},
                {"victory", victory},
                {"termination_reason", termination_reason}
            };
        }
    };

    struct LLMProposal {
        std::string narration;
        int suggested_time_minutes_cost = 0;
        int suggested_cash_cost = 0;
        int suggested_battery_cost = 0;
        std::string new_location;
        std::vector<std::string> inventory_add;
        std::vector<std::string> inventory_remove;
        bool game_over = false;
        bool victory = false;
        std::string reason;

        // Deserialization from Anthropic LLM JSON payload
        static LLMProposal fromJson(const nlohmann::json& j) {
            LLMProposal p;
            if (j.contains("narration")) p.narration = j["narration"];
            if (j.contains("suggested_time_minutes_cost")) p.suggested_time_minutes_cost = j["suggested_time_minutes_cost"];
            if (j.contains("suggested_cash_cost")) p.suggested_cash_cost = j["suggested_cash_cost"];
            if (j.contains("suggested_battery_cost")) p.suggested_battery_cost = j["suggested_battery_cost"];
            if (j.contains("new_location")) p.new_location = j["new_location"];
            if (j.contains("inventory_add")) p.inventory_add = j["inventory_add"].get<std::vector<std::string>>();
            if (j.contains("inventory_remove")) p.inventory_remove = j["inventory_remove"].get<std::vector<std::string>>();
            if (j.contains("game_over")) p.game_over = j["game_over"];
            if (j.contains("victory")) p.victory = j["victory"];
            if (j.contains("reason")) p.reason = j["reason"];
            return p;
        }
    };

} // namespace sbs