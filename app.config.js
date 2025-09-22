// app.config.js
import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    expo: {
      ...(config.expo || {}),
      scheme: process.env.EXPO_SCHEME || 'auramate',
      extra: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
    },
  };
};
