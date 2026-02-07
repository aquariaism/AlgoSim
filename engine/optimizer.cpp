#include <windows.h>
#include <iostream>
#include <fstream>
#include <cmath>
#include <thread>
#include <chrono>

// Objective function
double f(double x) {
    return x * x - 4 * x + 4;
}

int main() {
    std::ofstream file("output.csv");

    if (!file.is_open()) {
        std::cout << "Failed to open file\n";
        return 1;
    }

    double x = -10.0;
    double step = 0.1;

    for (int i = 0; i < 200; i++) {
        double current = f(x);
        double left = f(x - step);
        double right = f(x + step);

        if (left < current)
            x -= step;
        else if (right < current)
            x += step;

        file << i << "," << x << "," << f(x) << "\n";
        file.flush(); // VERY IMPORTANT

        Sleep(100); // milliseconds
    }

    file.close();
    std::cout << "Simulation finished\n";
    return 0;
}
