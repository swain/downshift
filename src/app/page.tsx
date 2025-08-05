"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useDebounce } from "use-debounce";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { CurrentAccount } from "../utils/client-auth";
import { makeStyles } from "../utils/styles";
import { trpc } from "../utils/trpc";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  servingSize: string;
  brandOwner?: string;
  dataType?: string;
}

const trackFood = async (foodData: {
  foodId: string;
  foodName: string;
  amount: number;
  calories: number;
  timestamp: string;
}) => {
  const response = await fetch("/api/track-food", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(foodData),
  });

  if (!response.ok) {
    throw new Error("Failed to track food");
  }

  return response.json();
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedAmount, setSelectedAmount] = useState("1");
  const searchInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Search foods query
  const { data: searchResults = [], isLoading: isSearching } =
    trpc.searchFoods.useQuery(
      { query: debouncedSearchQuery },
      {
        enabled:
          !!debouncedSearchQuery && debouncedSearchQuery.trim().length >= 2,
      },
    );

  // Track food mutation
  const trackFoodMutation = useMutation({
    mutationFn: trackFood,
    onSuccess: () => {
      handleFoodDeselect();
    },
    onError: (error) => {
      console.error("Failed to track food:", error);
    },
  });

  useEffect(() => {
    if (!selectedFood) {
      searchInputRef.current?.focus();
    } else {
      amountInputRef.current?.focus();
    }
  }, [selectedFood]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
  };

  const handleFoodDeselect = () => {
    setSelectedFood(null);
    setSelectedAmount("1");
    setSearchQuery("");
  };

  const handleSubmit = () => {
    if (!selectedFood) return;

    trackFoodMutation.mutate({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount: Number.parseFloat(selectedAmount),
      calories: selectedFood.calories * Number.parseFloat(selectedAmount),
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <AppText style={styles.header} variant="title" color="text">
            Downshift
          </AppText>
        </View>

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
              title={
                trackFoodMutation.isPending ? "Adding..." : "Add to Tracker"
              }
              onPress={handleSubmit}
              disabled={trackFoodMutation.isPending}
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
              searchResults?.map((item) => (
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

            {!isSearching &&
              !!searchQuery &&
              (!searchResults || searchResults.length === 0) && (
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
      <TouchableOpacity
        style={{ alignSelf: "center" }}
        onPress={CurrentAccount.clear}
      >
        <AppText variant="details" color="textSecondary">
          Logout
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing(5),
    maxWidth: 800,
    width: "100%",
    marginHorizontal: "auto",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(7.5),
  },
  header: {
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flex: 1,
    marginBottom: theme.spacing(5),
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 60,
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
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 60,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    color: theme.colors.text,
    outlineWidth: 0,
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
    gap: theme.spacing(2),
  },
  quickAmountButton: {
    flex: 1,
  },
  quickAmountButtonActive: {
    backgroundColor: theme.colors.primary,
  },
}));
