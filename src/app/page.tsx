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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedAmount, setSelectedAmount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!selectedFood) {
      searchInputRef.current?.focus();
    } else {
      amountInputRef.current?.focus();
    }
  }, [selectedFood]);

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
    setSearchQuery(food.name);
    setSearchResults([]);
  };

  const handleFoodDeselect = () => {
    setSelectedFood(null);
    setSelectedAmount("1");
    setSearchQuery("");
    setSearchResults([]);
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
        handleFoodDeselect();
      }
    } catch (error) {
      console.error("Failed to track food:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.header} variant="title" color="text">
        Downshift
      </AppText>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[
            styles.searchInput,
            selectedFood && styles.searchInputSelected,
          ]}
          onPress={() => {
            if (selectedFood) {
              handleFoodDeselect();
            }
            searchInputRef.current?.focus();
          }}
          activeOpacity={1}
        >
          <TextInput
            ref={searchInputRef}
            style={styles.searchTextInput}
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
            placeholderTextColor="#999"
            editable={!selectedFood}
          />
        </TouchableOpacity>
      </View>

      {selectedFood ? (
        <View style={styles.amountContainer}>
          <View style={styles.amountInputContainer}>
            <TextInput
              ref={amountInputRef}
              style={styles.amountInput}
              value={selectedAmount}
              onChangeText={setSelectedAmount}
              keyboardType="decimal-pad"
              selectTextOnFocus
              placeholder="Amount"
              placeholderTextColor="#999"
            />
            <AppText
              variant="body"
              color="textSecondary"
              style={styles.servingLabel}
            >
              {selectedFood.servingSize}
            </AppText>
          </View>

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

          <AppButton
            title={isSubmitting ? "Adding..." : "Add to Tracker"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      ) : (
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
            <AppText
              variant="body"
              color="placeholder"
              style={styles.centerText}
            >
              No foods found
            </AppText>
          )}
        </View>
      )}
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
  searchContainer: {
    marginBottom: theme.spacing(5),
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 50,
  },
  searchInputSelected: {
    backgroundColor: theme.colors.surface,
    opacity: 0.6,
  },
  searchTextInput: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
    outlineWidth: 0,
    borderWidth: 0,
    caretColor: theme.colors.primary,
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
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    marginBottom: theme.spacing(5),
    minHeight: 60,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    color: theme.colors.text,
  },
  servingLabel: {
    marginLeft: theme.spacing(2),
    fontSize: 14,
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
