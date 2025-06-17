
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project and add your Firebase project configuration:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    # If your Genkit Google AI plugin needs an explicit API key for Vercel deployment:
    # GOOGLE_API_KEY=your_google_ai_api_key 
    ```
    Replace `your_...` with your actual Firebase project credentials and Google AI API key if needed.
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  **Run Genkit development server (in a separate terminal):**
    If your application uses Genkit flows, you'll need to run the Genkit development server:
    ```bash
    npm run genkit:dev
    ```
    Or, to watch for changes in your flow files:
    ```bash
    npm run genkit:watch
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Next.js app. Genkit flows will typically be available on a different port (e.g., localhost:3400) as indicated by the `genkit start` command.

## Deployment to Firebase App Hosting

To deploy your MediShare application, Firebase App Hosting is recommended.

1.  **Install Firebase CLI:**
    If you don't have it installed, install the Firebase CLI globally:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase:**
    Authenticate with your Firebase account:
    ```bash
    firebase login
    ```

3.  **Initialize App Hosting in your Project:**
    Navigate to your project's root directory in the terminal and run:
    ```bash
    firebase init apphosting
    ```
    Follow the prompts:
    *   Select your Firebase project.
    *   It should detect your Next.js application. The existing `apphosting.yaml` is suitable for a basic deployment.

4.  **Create an App Hosting Backend (if needed):**
    If you haven't created an App Hosting backend resource through the Firebase Console yet, you can do so via the CLI:
    ```bash
    firebase apphosting:backends:create
    ```
    Follow the prompts to select a region. You can also connect a repository for CI/CD later if desired.

5.  **Configure Environment Variables in Firebase:**
    Your application requires environment variables (like `NEXT_PUBLIC_FIREBASE_API_KEY`, etc., and potentially `GOOGLE_API_KEY` for Genkit) to connect to your Firebase project and Google AI services. These are typically stored in a `.env.local` file for local development, which **should not be committed to your repository and will not be deployed automatically.**

    You **must** configure these environment variables in the Firebase console for your App Hosting backend:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your Firebase project.
    *   Navigate to "App Hosting" (under the "Build" section in the left sidebar).
    *   Select your backend from the list.
    *   Go to the "Settings" tab or look for an "Environment variables" section.
    *   Add each `NEXT_PUBLIC_FIREBASE_...` variable that your application needs, along with its corresponding value from your Firebase project configuration.
    *   Add `GOOGLE_API_KEY` if your Genkit Google AI plugin requires it for the deployed environment. Ensure these match what you have in your `.env.local` file.

6.  **Deploy your Application:**
    Once the environment variables are set in the Firebase Console, deploy your app:
    ```bash
    firebase deploy
    ```
    This command will build your Next.js application and deploy it to Firebase App Hosting. After the deployment is complete, the Firebase CLI will provide you with the URL where your application is hosted.

Remember to check the build logs in the Firebase console if you encounter any deployment issues.

## Deployment to Vercel

Vercel is another excellent platform for deploying Next.js applications.

1.  **Push your Code to a Git Repository:**
    Ensure your project is a Git repository and pushed to a provider like GitHub, GitLab, or Bitbucket. Vercel integrates directly with these services.

2.  **Sign Up/Login to Vercel:**
    Go to [vercel.com](https://vercel.com/) and create an account or log in.

3.  **Import Your Project:**
    *   From your Vercel dashboard, click "Add New..." -> "Project".
    *   Choose "Import Git Repository" and select the repository you pushed your code to. Vercel will typically auto-detect that it's a Next.js project.

4.  **Configure Your Project:**
    *   **Framework Preset:** Should be automatically set to "Next.js".
    *   **Build and Output Settings:** Vercel usually handles these automatically for Next.js (`npm run build` or `next build`, output directory `.next`).
    *   **Environment Variables:** This is crucial.
        *   Navigate to your project's settings in Vercel (Project -> Settings -> Environment Variables).
        *   Add all the environment variables your application needs. These are the same ones from your `.env.local` file:
            *   `NEXT_PUBLIC_FIREBASE_API_KEY`
            *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
            *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
            *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
            *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
            *   `NEXT_PUBLIC_FIREBASE_APP_ID`
            *   `GOOGLE_API_KEY` (If your Genkit Google AI plugin requires an explicit API key. This key should be kept secret and **not** prefixed with `NEXT_PUBLIC_`).
        *   Ensure you provide the correct values for your Firebase project and Google AI services.

5.  **Deploy:**
    Click the "Deploy" button. Vercel will build your application and deploy it. Once finished, you'll get a URL for your live site.

6.  **Genkit Flows on Vercel:**
    Your Genkit flows, defined in `src/ai/flows/`, are typically imported and used within Next.js Server Components or API Routes (implicitly via Server Actions). When deployed to Vercel, these flows will run as part of Vercel's serverless functions environment when invoked by your Next.js application. You do not need to deploy a separate Genkit server for this setup.

Remember to check the build logs in Vercel if you encounter any deployment issues.
