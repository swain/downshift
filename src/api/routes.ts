import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { usda } from "../utils/usda";

export type Context = { account: string };

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router({
  searchFoods: t.procedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await usda.request("GET /foods/search", {
        query: input.query,
        pageSize: 10,
      });

      // Transform USDA data to match the expected format
      const foods = (result.data.foods || []).map((food) => {
        const calorieNutrient = food.foodNutrients?.find(
          (nutrient) => nutrient.name === "Energy" || nutrient.number === 208,
        );

        return {
          id: food.fdcId.toString(),
          name: food.description,
          calories: calorieNutrient?.amount || 0,
          servingSize: "100g", // Default serving size
          brandOwner: food.brandOwner,
          dataType: food.dataType,
        };
      });

      return foods;
    }),
});

export type AppRouter = typeof router;
