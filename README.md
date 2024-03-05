# Soma - AI Bookworm Chatbot 📚

Soma is an AI-powered chatbot that specializes in recommending Japanese books. It leverages Langchain to chain together two Large Language Models (LLMs); one for generating book suggestions and another for fetching the suggested book details from the Rakuten API.

![Screenshot 1](@assets/top.jpeg)

![Screenshot 2](@assets/book-recommendation.jpeg)

## Features 🌟

- **Japanese Book Recommendations**: Soma provides personalized book recommendations from a vast selection of Japanese literature.
- **Dual AI Integration**: Utilizes one AI for understanding user requests and another for retrieving book data, ensuring accurate and relevant suggestions.
- **Chat Interface**: Engage with Soma through a user-friendly chat interface for a seamless experience.

## Technology Stack 💻

- **Next.js**: A React framework for building the user interface and handling server-side operations.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **OpenAI**: API used for AI-powered chat capabilities.
- **LangChain**: A library for chaining together multiple language models to create complex AI applications.
- **Vercel**: Platform for deploying and hosting the application.

## Getting Started 🚀

To run the project locally, you need to have Node.js and npm or pnpm installed. Follow these steps:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Create a `.env.local` file and add the necessary environment variables:
    ```plaintext
    OPENAI_API_KEY="your-openai-api-key"
    AUTH_SECRET="your-auth-secret"
    AUTH_GITHUB_ID="your-github-oauth-app-id"
    AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
    KV_REST_API_READ_ONLY_TOKEN="your-kv-read-only-token"
    KV_REST_API_TOKEN="your-kv-rest-api-token"
    KV_REST_API_URL="your-kv-rest-api-url"
    KV_URL="your-kv-url"
    ```
4. Run the development server with `npm run dev`.

## Project Structure 🏗️

- `app/`: Contains the main application logic and pages.
- `components/`: Reusable React components.
- `lib/`: Utility functions and hooks.
- `public/`: Static files like images and icons.
- `styles/`: Global CSS and Tailwind configuration.

## License 📄

This project is licensed under the Apache License, Version 2.0. You can obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

## Contributing 🤝

Contributions are welcome! Please read the contributing guidelines before making any changes or submitting a pull request.

For more information on the project's dependencies and scripts, refer to the `package.json` file.
