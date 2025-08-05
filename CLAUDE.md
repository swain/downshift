# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application with React Native Web integration and AWS infrastructure managed by CDKTF (Terraform CDK). The project uses React Native components that render on web through React Native Web.

## Guidance

- We're using **Next.js 15** with App Router (src/app directory structure)

- Always use TypeScript.

- React Native components should be used instead of normal HTML elements.

- But, this project is currently **web-only**. Don't bother implementing (or even creating) code paths for non-web platforms, and don't rely on platform-specific packages like AsyncStorage when there is an established web precedent like `localStorage`. But, DO always use React Native UI components, rather than HTML elements.

- Use React Native StyleSheet for cross-platform styling. But, do not directly use `StyleSheet.create(...)` -- instead use the `makeStyles` helper to create styles:

    ```tsx
    import { makeStyles } from "../utils/styles";

    const styles = makeStyles((theme) => ({
      // ...react native style entries can go here and reference the theme.
      foo: {
        backgroundColor: theme.colors.background
      }
    }));
    
    export const MyComponent = () => {
      return <View style={styles.foo}>
    }
    ```

- Be sure to use the `AppText` and `AppButton` components when building new UI, instead of using the lower-level React Native elements.

- If you make changes in a session that consist of more than 1-2 files changes, run Biome formatting on the new files after all your changes are complete.

- Always prefer arrow functions over `function` declarations, even for top-level function declarations.

## API Development

This project uses **tRPC** for type-safe API development. tRPC provides end-to-end type safety from server to client without code generation.

### tRPC Setup

The tRPC router is defined in `src/api/routes.ts` with procedures using the tRPC instance. Authentication is handled automatically via the `account_key` cookie.

### Adding New API Endpoints

Add procedures to the router in `src/api/routes.ts`:

```tsx
export const router = t.router({
  // Query procedure (for fetching data)
  searchFoods: t.procedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // ctx.account available for authenticated requests
      // Implementation here
      return { foods: [] };
    }),

  // Mutation procedure (for modifying data)
  createFood: t.procedure
    .input(z.object({
      name: z.string(),
      calories: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation here
      return { id: "new-id", ...input };
    }),
});
```

### Client-Side Usage

Use the tRPC client from `src/utils/trpc.ts`:

```tsx
import { trpc } from "../utils/trpc";

export const MyComponent = () => {
  // Query data with React Query integration
  const { data, isLoading } = trpc.searchFoods.useQuery({
    query: "apple",
  });

  // Mutations
  const createFood = trpc.createFood.useMutation({
    onSuccess: () => {
      // Handle success
    },
  });

  const handleCreate = () => {
    createFood.mutate({
      name: "Banana",
      calories: 105,
    });
  };

  return (
    // Component JSX
  );
};
```

### Key Features

- **End-to-End Type Safety**: Full TypeScript inference from server to client
- **React Query Integration**: Built-in caching, optimistic updates, and background refetching via `@trpc/react-query`
- **Authentication**: All procedures automatically have access to authenticated user's account via `ctx.account`
- **Input Validation**: Zod schemas validate all inputs automatically
- **Superjson**: Handles serialization of complex types like Date objects

### Authentication

Authentication is handled in the tRPC context creation at `src/app/api/trpc/[trpc]/route.ts`. The `account_key` cookie is automatically parsed and available as `ctx.account` in all procedures. If no valid account cookie is found, requests will throw an error.
