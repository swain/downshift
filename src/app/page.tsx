"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { makeStyles } from "../utils/styles";

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
          <AppButton
            title="← Back"
            onPress={handleBackToSearch}
            style={styles.backButton}
          />
          <AppText variant="title" color="text">
            How much?
          </AppText>
          <AppText variant="body" color="textSecondary">
            {selectedFood.name}
          </AppText>
        </View>

        <View style={styles.amountContainer}>
          <AppText variant="header" color="text">
            Amount ({selectedFood.servingSize})
          </AppText>
          <TextInput
            style={styles.amountInput}
            value={selectedAmount}
            onChangeText={setSelectedAmount}
            keyboardType="decimal-pad"
            selectTextOnFocus
            autoFocus
          />

          <View style={styles.caloriePreview}>
            <AppText variant="body" color="textSecondary">
              {Math.round(
                selectedFood.calories *
                  Number.parseFloat(selectedAmount || "0"),
              )}{" "}
              calories
            </AppText>
          </View>

          <View style={styles.quickAmounts}>
            {["0.5", "1", "1.5", "2"].map((amount) => (
              <AppButton
                key={amount}
                title={amount}
                onPress={() => setSelectedAmount(amount)}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amount && styles.quickAmountButtonActive,
                ]}
              />
            ))}
          </View>
        </View>

        <AppButton
          title={isSubmitting ? "Adding..." : "Add to Tracker"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.header} variant="title" color="text">
        Downshift
      </AppText>

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
        {isSearching && (
          <AppText
            variant="body"
            color="textSecondary"
            style={styles.centerText}
          >
            Searching...
          </AppText>
        )}

        {!isSearching &&
          searchResults.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultItem}
              onPress={() => handleFoodSelect(item)}
              activeOpacity={0.7}
            >
              <AppText variant="header" color="text">
                {item.name}
              </AppText>
              <AppText variant="details" color="textSecondary">
                {item.servingSize}
              </AppText>
            </TouchableOpacity>
          ))}

        {!isSearching && !!searchQuery && searchResults.length === 0 && (
          <AppText variant="body" color="placeholder" style={styles.centerText}>
            No foods found
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(15),
  },
  header: {
    alignSelf: "center",
    marginBottom: theme.spacing(7.5),
  },
  backButton: {
    marginBottom: theme.spacing(2.5),
    alignSelf: "flex-start",
  },
  searchContainer: {
    marginBottom: theme.spacing(5),
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
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
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: theme.spacing(2),
  },
  centerText: {
    textAlign: "center",
    marginTop: theme.spacing(5),
  },
  amountContainer: {
    flex: 1,
    marginBottom: theme.spacing(7.5),
  },
  amountInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: theme.spacing(5),
    minHeight: 60,
  },
  caloriePreview: {
    alignItems: "center",
    marginBottom: theme.spacing(7.5),
  },
  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing(5),
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: theme.spacing(1),
  },
  quickAmountButtonActive: {
    backgroundColor: theme.colors.primary,
  },
}));
