# Environment Variables Setup

## Quick Setup

0. Please run `npm i` before starting

1. **Create a `.env` file** in the root directory (same level as `package.json`)

2. **Copy from `.env.example`** or use this template:

```env
# API Configuration
# Replace with your actual API base URL
EXPO_PUBLIC_API_URL=https://api.example.com

# App Environment
# Options: development, staging, production
EXPO_PUBLIC_ENV=development
```

3. **Update the values** with your actual API URL

## Environment Variables

### `EXPO_PUBLIC_API_URL`
- **Description**: Base URL for your API server
- **Required**: Yes
- **Example**: `https://api.yourserver.com` or `http://localhost:3000/api`
- **Note**: In Expo, variables must be prefixed with `EXPO_PUBLIC_` to be accessible

### `EXPO_PUBLIC_ENV`
- **Description**: Current environment (development, staging, production)
- **Required**: No (defaults to development)
- **Example**: `development`, `staging`, `production`

## Important Notes

1. **Expo Environment Variables**: 
   - Variables must start with `EXPO_PUBLIC_` to be accessible
   - After changing `.env`, restart Expo development server

2. **Security**:
   - Never commit `.env` file to version control
   - `.env` is already in `.gitignore`
   - Use `.env.example` as a template

3. **Restart Required**:
   ```bash
   npm start
   # or
   npx expo start
   ```

## Usage in Code

Environment variables are accessed via:

```typescript
// In utils/constants.ts
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com",
    // ...
};
```

## Example Configurations

### Development
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

### Staging
```env
EXPO_PUBLIC_API_URL=https://staging-api.yourserver.com
EXPO_PUBLIC_ENV=staging
```

### Production
```env
EXPO_PUBLIC_API_URL=https://api.yourserver.com
EXPO_PUBLIC_ENV=production
```

