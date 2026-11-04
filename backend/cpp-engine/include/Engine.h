#pragma once
#include "GameState.h"
#include <string>
#include <nlohmann/json.hpp>

namespace sbs {

    class Engine {
    public:
        Engine();
        
        // Reset the game to the starting conditions
        void reset();

        // Retrieve the current uncompromised state
        GameState getState() const;

        // Core business logic: Process an LLM proposal against hard game rules
        // Returns the valid resulting JSON to pass back to the frontend
        nlohmann::json processLLMProposal(const LLMProposal& proposal, const std::string& user_action);

    private:
        GameState current_state;

        // Internal validators representing the non-negotiable rules
        void enforceTime(int proposed_cost);
        void enforceFinances(int proposed_cost);
        void enforceBattery(int proposed_cost, const std::string& action);
        void enforceLocation(const std::string& proposed_location);
        void enforceInventory(const std::vector<std::string>& add, const std::vector<std::string>& remove);
        void checkWinLossConditions();
        
        bool requiresDigitalPayment(const std::string& action) const;
    };

} // namespace sbs