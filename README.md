

# Autism Detection App with M-CHAT Support

This is a web application designed to assist in the early detection of autism using the **M-CHAT (Modified Checklist for Autism in Toddlers)** questionnaire. The app also provides support tools for tracking and managing early intervention efforts.

Built with [Chef](https://chef.convex.dev) and powered by [Convex](https://convex.dev) for backend services.

---

## 🔧 Project Setup

- **Frontend**: Located in the `app` directory and built using [Vite](https://vitejs.dev/).
- **Backend**: All Convex backend logic and data functions are in the `convex` directory.

To run the project locally:

```bash
npm run dev         # Starts both frontend and backend dev servers
npx convex dev      # Starts the Convex backend only
````

---

## 🔐 Authentication

Authentication is set up using [Convex Auth](https://auth.convex.dev/), with anonymous login enabled by default. You can update the auth settings based on your deployment or user access needs.

---

## 🌍 Deployment & Documentation

For guidance on using Convex effectively:

* [Getting Started](https://docs.convex.dev/understanding/)
* [Hosting & Deployment](https://docs.convex.dev/production/)
* [Best Practices](https://docs.convex.dev/understanding/best-practices/)

This app is currently connected to the Convex project:
[`valuable-dog-744`](https://dashboard.convex.dev/d/valuable-dog-744)

---

## 🌐 HTTP Routes

Custom HTTP endpoints are defined in `convex/router.ts`. These are kept separate from `convex/http.ts` to simplify managing authentication and API logic.

---

## 🧠 About M-CHAT

The **M-CHAT** is a widely used screening tool designed to identify children who may be at risk for autism spectrum disorder (ASD). This app aims to make the process more accessible and assist caregivers, health professionals, and researchers with early detection and monitoring.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributions

Contributions are welcome! If you find issues or have suggestions, feel free to open an issue or submit a pull request.

```

---


**Convex** operates on a custom-built, reactive database system. It uses MySQL on AWS RDS in production for durability, and SQLite when you're self-hosting locally. This setup powers its real-time, type-safe, type-checked developer experience while ensuring persistent storage.