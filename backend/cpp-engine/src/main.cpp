#define HTTPLIB_USE_ZLIB_IF_AVAILABLE
#include <httplib.h>
#include <nlohmann/json.hpp>
#include <iostream>
#include "Engine.h"

using json = nlohmann::json;

int main() {
    httplib::Server svr;
    sbs::Engine game_engine;

    // CORS Preflight Handler
    svr.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 200;
    });

    // Middleware for CORS on all routes
    svr.set_post_routing_handler([](const auto&, auto& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
    });

    // Health check endpoint
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("{\"status\": \"healthy\"}", "application/json");
    });

    // Get current game state
    svr.Get("/engine/state", [&](const httplib::Request&, httplib::Response& res) {
        json state = game_engine.getState().toJson();
        res.set_content(state.dump(), "application/json");
    });

    // Reset the game
    svr.Post("/engine/reset", [&](const httplib::Request&, httplib::Response& res) {
        game_engine.reset();
        json state = game_engine.getState().toJson();
        res.set_content(state.dump(), "application/json");
    });

    // Process an action proposed by the LLM
    svr.Post("/engine/action", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            json body = json::parse(req.body);
            
            // Extract the user's raw action and the LLM's proposal
            std::string user_action = body.value("user_action", "");
            json llm_proposal_json = body["proposal"];
            
            // Convert JSON back to struct
            sbs::LLMProposal proposal = sbs::LLMProposal::fromJson(llm_proposal_json);

            // Process through the hard rules engine
            json new_state = game_engine.processLLMProposal(proposal, user_action);
            
            res.set_content(new_state.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    std::cout << "Silk Board Survival C++ Engine starting on http://0.0.0.0:8080" << std::endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}