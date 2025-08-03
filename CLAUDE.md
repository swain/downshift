# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application with React Native Web integration and AWS infrastructure managed by CDKTF (Terraform CDK). The project combines web and mobile-first development patterns using React Native components that render both on native platforms and web.

## Code Formatting and Linting

The project uses Biome for formatting, linting, and import organization:

- 2-space indentation
- Double quotes for JavaScript strings
- Recommended rules enabled with some performance and complexity exceptions
- Automatic import organization
- Run formatting/linting through your editor or Biome CLI

## Architecture

### Frontend Stack

- **Next.js 15** with App Router (src/app directory structure)
- **React Native Web** integration for cross-platform component development
- **TypeScript** throughout
- Supports `.web.js/jsx/ts/tsx` file extensions for web-specific implementations

### Styling

- React Native StyleSheet for cross-platform styling
- Geist font family (sans and mono variants)

## Key Integration Points

- React Native components should be used instead of normal HTML elements
- Next.js handles both web bundling and the React Native Web transpilation