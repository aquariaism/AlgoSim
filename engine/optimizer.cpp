#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <random>
#include <cmath>
#include <chrono>
#include <thread>

#ifdef _WIN32
#include <windows.h>
#define SLEEP(ms) Sleep(ms)
#else
#include <unistd.h>
#define SLEEP(ms) usleep((ms) * 1000)
#endif

using namespace std;

// Fitness functions
double rastrigin(double x) {
    return x * x - 10 * cos(2 * 3.141592653589793 * x) + 10;
}

double sphere(double x) {
    return x * x;
}

double rosenbrock(double x) {
    // Simplified 1D Rosenbrock
    return (1 - x) * (1 - x) + 100 * x * x;
}

double ackley(double x) {
    return -20 * exp(-0.2 * abs(x)) - exp(cos(2 * 3.141592653589793 * x)) + 20 + 2.718281828;
}

typedef double (*FitnessFunc)(double);

struct GAConfig {
    int popSize;
    int generations;
    double mutationRate;
    double crossoverRate;
    double eliteRatio;
    int delay;
    string function;
    double minBound;
    double maxBound;
};

GAConfig loadConfig() {
    GAConfig config;
    config.popSize = 50;
    config.generations = 100;
    config.mutationRate = 0.1;
    config.crossoverRate = 0.8;
    config.eliteRatio = 0.2;
    config.delay = 100;
    config.function = "rastrigin";
    config.minBound = -5.12;
    config.maxBound = 5.12;

    ifstream configFile("config.txt");
    if (configFile.is_open()) {
        string line;
        while (getline(configFile, line)) {
            if (line.find("popSize=") == 0)
                config.popSize = stoi(line.substr(8));
            else if (line.find("generations=") == 0)
                config.generations = stoi(line.substr(12));
            else if (line.find("mutationRate=") == 0)
                config.mutationRate = stod(line.substr(13));
            else if (line.find("crossoverRate=") == 0)
                config.crossoverRate = stod(line.substr(14));
            else if (line.find("eliteRatio=") == 0)
                config.eliteRatio = stod(line.substr(11));
            else if (line.find("delay=") == 0)
                config.delay = stoi(line.substr(6));
            else if (line.find("function=") == 0)
                config.function = line.substr(9);
            else if (line.find("minBound=") == 0)
                config.minBound = stod(line.substr(9));
            else if (line.find("maxBound=") == 0)
                config.maxBound = stod(line.substr(9));
        }
        configFile.close();
    }
    return config;
}

FitnessFunc selectFunction(const string& name) {
    if (name == "sphere") return sphere;
    if (name == "rosenbrock") return rosenbrock;
    if (name == "ackley") return ackley;
    return rastrigin;
}

int main() {
    GAConfig config = loadConfig();
    FitnessFunc fitness = selectFunction(config.function);

    ofstream file("output.csv");
    file << "generation,best_fitness,avg_fitness,worst_fitness,diversity\n";

    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dist(config.minBound, config.maxBound);
    uniform_real_distribution<> mutation_dist(-1, 1);
    uniform_real_distribution<> prob(0, 1);

    // Initial population
    vector<double> population;
    population.reserve(config.popSize);
    for (int i = 0; i < config.popSize; i++) {
        population.push_back(dist(gen));
    }

    cout << "Starting Genetic Algorithm..." << endl;
    cout << "Function: " << config.function << endl;
    cout << "Population: " << config.popSize << endl;
    cout << "Generations: " << config.generations << endl;

    auto startTime = chrono::high_resolution_clock::now();

    for (int g = 0; g < config.generations; g++) {
        // Calculate fitness for all individuals
        vector<pair<double, double>> fitnessValues;
        fitnessValues.reserve(config.popSize);
        
        for (double ind : population) {
            fitnessValues.push_back({fitness(ind), ind});
        }

        // Sort by fitness (ascending - minimization)
        sort(fitnessValues.begin(), fitnessValues.end());

        double best = fitnessValues[0].first;
        double worst = fitnessValues[config.popSize - 1].first;
        
        // Calculate average fitness
        double sum = 0;
        for (const auto& fv : fitnessValues) {
            sum += fv.first;
        }
        double avg = sum / config.popSize;

        // Calculate diversity (standard deviation of population)
        double variance = 0;
        double mean_pos = 0;
        for (const auto& fv : fitnessValues) {
            mean_pos += fv.second;
        }
        mean_pos /= config.popSize;
        
        for (const auto& fv : fitnessValues) {
            variance += (fv.second - mean_pos) * (fv.second - mean_pos);
        }
        double diversity = sqrt(variance / config.popSize);

        // Write to CSV
        file << g << "," << best << "," << avg << "," << worst << "," << diversity << "\n";
        file.flush();

        if (g % 10 == 0) {
            cout << "Gen " << g << ": Best=" << best << ", Avg=" << avg << endl;
        }

        // New population
        vector<double> new_population;
        new_population.reserve(config.popSize);

        // Elitism - keep top performers
        int eliteCount = (int)(config.popSize * config.eliteRatio);
        for (int i = 0; i < eliteCount; i++) {
            new_population.push_back(fitnessValues[i].second);
        }

        // Crossover and mutation
        while (new_population.size() < config.popSize) {
            // Tournament selection
            int t1 = rand() % (config.popSize / 2);
            int t2 = rand() % (config.popSize / 2);
            int t3 = rand() % (config.popSize / 2);
            int t4 = rand() % (config.popSize / 2);
            
            int p1 = (fitnessValues[t1].first < fitnessValues[t2].first) ? t1 : t2;
            int p2 = (fitnessValues[t3].first < fitnessValues[t4].first) ? t3 : t4;

            double child;
            
            // Crossover
            if (prob(gen) < config.crossoverRate) {
                double alpha = prob(gen);
                child = alpha * fitnessValues[p1].second + (1 - alpha) * fitnessValues[p2].second;
            } else {
                child = fitnessValues[p1].second;
            }

            // Mutation
            if (prob(gen) < config.mutationRate) {
                double mutation_strength = 0.5 * (1 - (double)g / config.generations); // Adaptive
                child += mutation_dist(gen) * mutation_strength;
                
                // Boundary check
                if (child < config.minBound) child = config.minBound;
                if (child > config.maxBound) child = config.maxBound;
            }

            new_population.push_back(child);
        }

        population = new_population;

        SLEEP(config.delay);
    }

    auto endTime = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(endTime - startTime);

    file.close();
    
    cout << "\n=== Genetic Algorithm Finished ===" << endl;
    cout << "Total time: " << duration.count() << "ms" << endl;
    cout << "Final best fitness: " << fitness(population[0]) << endl;
    
    return 0;
}