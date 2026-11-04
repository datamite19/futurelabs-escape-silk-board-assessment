#include "TrafficSim.h"
#include <algorithm>
#include <cctype>

namespace sbs {

    const std::unordered_map<std::string, std::vector<std::string>> TrafficSim::valid_routes = {
        {"Silk Board Junction", {"HSR Layout", "Koramangala", "BTM Layout"}},
        {"BTM Layout", {"Silk Board Junction", "Jayanagar"}},
        {"HSR Layout", {"Silk Board Junction", "Bellandur", "Koramangala"}},
        {"Koramangala", {"Silk Board Junction", "HSR Layout", "Indiranagar", "MG Road"}},
        {"Bellandur", {"HSR Layout", "Marathahalli"}},
        {"Marathahalli", {"Bellandur", "KR Puram"}},
        {"KR Puram", {"Marathahalli", "Hebbal"}},
        {"Indiranagar", {"Koramangala", "MG Road", "KR Puram"}},
        {"MG Road", {"Koramangala", "Indiranagar", "Malleswaram", "Hebbal"}},
        {"Jayanagar", {"BTM Layout", "Malleswaram"}},
        {"Malleswaram", {"Jayanagar", "MG Road", "Hebbal"}},
        {"Hebbal", {"MG Road", "Malleswaram", "KR Puram", "Yelahanka"}},
        {"Yelahanka", {"Hebbal", "Bengaluru International Airport"}},
        {"Bengaluru International Airport", {"Yelahanka"}}
    };

    std::string TrafficSim::normalizeLocation(const std::string& input) {
        if (input.find("Airport") != std::string::npos || input.find("KIA") != std::string::npos) {
            return "Bengaluru International Airport";
        }
        if (input.find("Silk Board") != std::string::npos) {
            return "Silk Board Junction";
        }
        return input;
    }

    bool TrafficSim::isValidRoute(const std::string& current, const std::string& destination) {
        if (current == destination) return true;
        auto it = valid_routes.find(current);
        if (it == valid_routes.end()) return false;
        const auto& neighbors = it->second;
        return std::find(neighbors.begin(), neighbors.end(), destination) != neighbors.end();
    }

} // namespace sbs