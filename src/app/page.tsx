"use client";

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  servingSize: string;
}

type Screen = "search" | "amount";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedAmount, setSelectedAmount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (currentScreen === "search") {
      searchInputRef.current?.focus();
    }
  }, [currentScreen]);

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockResults: FoodItem[] = [
      { id: "1", name: "Apple", calories: 95, servingSize: "1 medium" },
      { id: "2", name: "Banana", calories: 105, servingSize: "1 medium" },
      { id: "3", name: "Orange", calories: 85, servingSize: "1 medium" },
      { id: "4", name: "Chicken Breast", calories: 165, servingSize: "100g" },
      {
        id: "5",
        name: "White Rice",
        calories: 205,
        servingSize: "1 cup cooked",
      },
      { id: "6", name: "Broccoli", calories: 25, servingSize: "1 cup" },
      { id: "7", name: "Eggs", calories: 70, servingSize: "1 large" },
    ].filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchFoods(text);
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setCurrentScreen("amount");
  };

  const handleBackToSearch = () => {
    setCurrentScreen("search");
    setSelectedFood(null);
    setSelectedAmount("1");
  };

  const handleSubmit = async () => {
    if (!selectedFood) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/track-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodId: selectedFood.id,
          foodName: selectedFood.name,
          amount: Number.parseFloat(selectedAmount),
          calories: selectedFood.calories * Number.parseFloat(selectedAmount),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        handleBackToSearch();
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to track food:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentScreen === "amount" && selectedFood) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackToSearch}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>How much?</Text>
          <Text style={styles.subtitle}>{selectedFood.name}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            Amount ({selectedFood.servingSize})
          </Text>
          <TextInput
            style={styles.amountInput}
            value={selectedAmount}
            onChangeText={setSelectedAmount}
            keyboardType="decimal-pad"
            selectTextOnFocus
            autoFocus
          />

          <View style={styles.caloriePreview}>
            <Text style={styles.caloriePreviewText}>
              {Math.round(
                selectedFood.calories *
                  Number.parseFloat(selectedAmount || "0"),
              )}{" "}
              calories
            </Text>
          </View>

          <View style={styles.quickAmounts}>
            {["0.5", "1", "1.5", "2"].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amount && styles.quickAmountButtonActive,
                ]}
                onPress={() => setSelectedAmount(amount)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    selectedAmount === amount && styles.quickAmountTextActive,
                  ]}
                >
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Adding..." : "Add to Tracker"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calorie Tracker</Text>
        <Text style={styles.subtitle}>Search for foods to track</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search foods..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.resultsContainer}>
        {isSearching && <Text style={styles.loadingText}>Searching...</Text>}

        {!isSearching &&
          searchResults.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultItem}
              onPress={() => handleFoodSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.servingSize}>{item.servingSize}</Text>
            </TouchableOpacity>
          ))}

        {!isSearching && searchQuery && searchResults.length === 0 && (
          <Text style={styles.noResults}>No foods found</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 50,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  servingSize: {
    fontSize: 14,
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  noResults: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  amountContainer: {
    flex: 1,
    marginBottom: 30,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  amountInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    minHeight: 60,
  },
  caloriePreview: {
    alignItems: "center",
    marginBottom: 30,
  },
  caloriePreviewText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  quickAmountButtonActive: {
    backgroundColor: "#007AFF",
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  quickAmountTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
