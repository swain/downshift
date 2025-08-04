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

This project uses a custom home-rolled API system with type-safe contracts controlled by Zod schemas. Here's how to work with the API:

### API Contract System

All API endpoints are defined in a centralized contract located at `src/api/contract.ts`. Each endpoint specifies both request and response schemas using Zod:

```tsx
export const APIContract = {
  "GET /search-foods": {
    request: z.object({
      query: z.string().optional(),
      limit: z.number().optional(),
    }),
    response: z.object({
      foods: z.array(z.object({
        id: z.string(),
        name: z.string(),
      })),
    }),
  },
} satisfies Record<string, { request: z.ZodType; response: z.ZodType }>;
```

### Adding New API Endpoints

1. **Define the contract** in `src/api/contract.ts`:
   - Use the format `"METHOD /path"` as the key
   - Specify both `request` and `response` Zod schemas
   - Supports path parameters using `:param` syntax (e.g., `"GET /items/:id"`)

2. **Implement the handler** in `src/api/routes.ts`:

   ```tsx
   export const router = new Router()
     .handle("GET /search-foods", async (ctx) => {
       // ctx.account: string (from cookie authentication)
       // ctx.params: extracted path parameters 
       // ctx.data: validated request data
       // ctx.request: original Request object
       
       return {
         status: 200,
         data: {
           // Response data matching the contract schema
         },
       };
     });
   ```

### Client-Side API Usage

Use the pre-configured client from `src/api/util-client.ts`:

```tsx
import { client } from "../api/util-client";

// Make API calls with full type safety
const response = await client.request("GET /search-foods", {
  query: "apple",
  limit: 10,
});

// response.data is fully typed based on the contract
```

### Key Features

- **Type Safety**: Both request and response are fully typed based on the contract
- **Path Parameters**: Automatically extracted from URLs with `:param` syntax
- **Authentication**: All routes require `account_key` cookie for authentication
- **Validation**: Request/response data is validated against Zod schemas
- **Error Handling**: Comprehensive error responses for validation failures and server errors

### Authentication

All API endpoints automatically require authentication via the `account_key` cookie. The auth validation happens in the central route handler at `src/app/api/[...]/route.ts`.

### Router Implementation Details

- Uses `itty-router` under the hood for the actual routing
- Central Next.js catch-all route handler at `src/app/api/[...]/route.ts`
- Custom `Router` class in `src/api/util-server.ts` provides type-safe route registration
- Supports GET, POST, PUT, PATCH, DELETE methods
