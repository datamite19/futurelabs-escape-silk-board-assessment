#pragma once
#include <string>
#include <vector>
#include <unordered_map>

namespace sbs {

    class TrafficSim {
    public:
        // Returns true if the move from 'current' to 'destination' is a physically valid route
        static bool isValidRoute(const std::string& current, const std::string& destination);
        
        // Normalize location names (handles minor spelling differences from LLM)
        static std::string normalizeLocation(const std::string& input);

    private:
        // Graph representing valid roads/connections in Bengaluru
        static const std::unordered_map<std::string, std::vector<std::string>> valid_routes;
    };

} // namespace sbs