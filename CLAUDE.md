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