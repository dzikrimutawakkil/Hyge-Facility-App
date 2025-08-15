# Hyge Facility Booking App

Welcome to the Hyge Facility Booking App! This is a mobile application built with React Native and Expo that allows users to easily browse, book, and manage facilities.

<img src="https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/images/app-logo.png" alt="Hyge Facility App Logo" width="150">

## 🚀 Features

* **User Authentication**: Secure sign-up and login functionality.
* **Facility Listings**: Browse a list of available facilities with search functionality.
* **Detailed View**: Get detailed information about each facility, including descriptions and availability.
* **Booking System**: Check daily and monthly availability and book time slots.
* **Booking Management**: View a list of all personal bookings, with options to filter by status (booked, cancelled).
* **Profile Management**: View and update user profile information, including name, email, and password.
* **Modern UI**: A clean, modern, and user-friendly interface.

---

## 🛠️ Tech Stack

* **Framework**: React Native with Expo
* **Language**: TypeScript
* **Navigation**: Expo Router
* **State Management**: Zustand
* **Data Fetching**: React Query
* **API Client**: Axios
* **Form Handling**: React Hook Form with Zod for validation

---

## 💡 Libraries and Design Decisions

This project leverages a modern and efficient stack to ensure a high-quality development experience and a robust final product.

* **Expo**: Chosen for its managed workflow, which simplifies the development process by handling native project configuration. This allows for faster iteration and easier builds.
* **Expo Router**: Implements file-based routing, making navigation intuitive and easy to manage as the application grows.
* **TypeScript**: Used to add static typing to JavaScript, which helps catch errors early, improves code quality, and makes the codebase easier to maintain.
* **Zustand**: A lightweight and minimalistic state management library. It was selected for its simplicity and small bundle size, providing powerful state management without the boilerplate of more complex solutions.
* **React Query**: Handles all server-state management. It simplifies data fetching, caching, and synchronization, reducing the amount of code needed for handling loading states and errors.
* **Axios**: A promise-based HTTP client for making requests to the backend API. It's configured with interceptors to automatically handle API tokens and refresh them when they expire.
* **React Hook Form & Zod**: This combination provides a powerful and efficient way to handle forms. React Hook Form optimizes form rendering, while Zod allows for easy and declarative schema validation.

---

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Expo CLI](https://docs.expo.dev/get-started/installation/):
    ```bash
    npm install -g expo-cli
    ```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/dzikrimutawakkil/hyge-facility-app.git](https://github.com/dzikrimutawakkil/hyge-facility-app.git)
    cd hyge-facility-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    expo start
    ```

2.  **Run on a device or simulator:**
    * Scan the QR code with the Expo Go app on your iOS or Android device.
    * Press `i` to run on an iOS simulator or `a` to run on an Android emulator.

---

## 📁 Project Structure

The project is organized with a feature-based approach to keep the codebase modular and maintainable. This structure is inspired by the principles outlined in the [bulletproof-react](https://github.com/alan2207/bulletproof-react) repository, which promotes scalability and separation of concerns.


.
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── booking.tsx
│   │   └── index.tsx
│   ├── facility/
│   │   └── [id].tsx
│   └── ...
├── src/
│   ├── features/
│   │   ├── auth/
│   │   ├── bookings/
│   │   └── facilities/
│   ├── hooks/
│   └── libs/
├── assets/
└── constants/


---

## 🖼️ Screenshots

| Login | Register | Facility List |
| :---: | :---: | :---: |
| ![Login Screen](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0006.jpg) | ![Register Screen](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0007.jpg) | ![Facility List](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0008.jpg) |

| Facility Details | Booking | Booking List |
| :---: | :---: | :---: |
| ![Facility Details](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0005.jpg) | ![Booking Screen](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0003.jpg) | ![Booking List](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0001.jpg) |

| Profile |
| :---: |
| ![Profile Screen](https://raw.githubusercontent.com/dzikrimutawakkil/hyge-facility-app/main/assets/screenshots/IMG-20250816-WA0002.jpg) |

---

## 🌐 API

This application connects to a backend API for all its data operations. The base URL for the API is:

`https://booking-api.hyge.web.id`

All API calls are managed through a centralized Axios instance with interceptors for handling authentication tokens and refreshing them when necessary.
