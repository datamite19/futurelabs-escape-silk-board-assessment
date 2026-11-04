#include <gtest/gtest.h>
#include "Engine.h"
#include "TrafficSim.h"

using namespace sbs;

// Test initial state setup
TEST(EngineTest, InitialState) {
    Engine engine;
    GameState state = engine.getState();
    EXPECT_EQ(state.elapsed_time_minutes, 0);
    EXPECT_EQ(state.cash, 1000);
    EXPECT_EQ(state.battery, 100);
    EXPECT_EQ(state.current_location, "Silk Board Junction");
    EXPECT_FALSE(state.game_over);
}

// Test Teleportation Prevention Rule
TEST(TrafficTest, TeleportationBlocked) {
    // Cannot jump from Silk Board straight to Airport
    EXPECT_FALSE(TrafficSim::isValidRoute("Silk Board Junction", "Bengaluru International Airport"));
    // Valid hop should pass
    EXPECT_TRUE(TrafficSim::isValidRoute("Silk Board Junction", "HSR Layout"));
}

// Test Engine Rules Processing (Proposal Validation)
TEST(EngineTest, ProcessesProposalValidMove) {
    Engine engine;
    LLMProposal proposal;
    proposal.narration = "Moving to HSR";
    proposal.suggested_time_minutes_cost = 15;
    proposal.suggested_cash_cost = 50;
    proposal.suggested_battery_cost = 5;
    proposal.new_location = "HSR Layout";

    nlohmann::json res = engine.processLLMProposal(proposal, "Take auto to HSR");
    EXPECT_EQ(res["current_location"], "HSR Layout");
    EXPECT_EQ(res["elapsed_time_minutes"], 15);
    EXPECT_EQ(res["cash"], 950);
}