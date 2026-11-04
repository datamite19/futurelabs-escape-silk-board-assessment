cmake_minimum_required(VERSION 3.20)
project(SilkBoardSurvivalEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Fetch Dependencies Automatically
include(FetchContent)

# 1. JSON library (nlohmann/json)
FetchContent_Declare(json
  URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
)
FetchContent_MakeAvailable(json)

# 2. HTTP Server/Client library (cpp-httplib)
FetchContent_Declare(httplib
  GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
  GIT_TAG v0.15.3
)
FetchContent_MakeAvailable(httplib)

# 3. GoogleTest (for our test suite)
FetchContent_Declare(googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG v1.14.0
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Define Include Directories
include_directories(include)

# Main Engine Library (Using PUBLIC so executables inherit dependencies)
add_library(EngineLib
  src/Engine.cpp
  src/TrafficSim.cpp
)
target_link_libraries(EngineLib PUBLIC nlohmann_json::nlohmann_json httplib)

# Main Executable (HTTP Server)
add_executable(silk_engine src/main.cpp)
target_link_libraries(silk_engine PRIVATE EngineLib nlohmann_json::nlohmann_json httplib)

# Unit Tests Executable
enable_testing()
add_executable(engine_tests tests/test_engine.cpp)
target_link_libraries(engine_tests PRIVATE EngineLib gtest_main nlohmann_json::nlohmann_json httplib)

include(GoogleTest)
gtest_discover_tests(engine_tests)