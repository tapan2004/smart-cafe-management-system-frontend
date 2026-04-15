# ☕ CafeFlow | Operational Intelligence & POS Ecosystem

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/SpringBoot-3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

**CafeFlow** is an enterprise-grade Full-Stack POS (Point of Sale) and Management System. It leverages **Neural Operational Intelligence** to streamline cafe operations, drive revenue through AI-powered upselling, and ensure 100% accountability with an immutable audit trail.

---

## 📸 System Visuals

<img width="1917" height="1079" alt="Screenshot 2026-04-16 042538" src="https://github.com/user-attachments/assets/d886a434-2338-40bd-8fb9-410daa032f28" />
<img width="1919" height="950" alt="Screenshot 2026-04-16 042521" src="https://github.com/user-attachments/assets/fc1e95c1-fea7-4243-8072-f612b9a1f9a6" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 043638" src="https://github.com/user-attachments/assets/3c08712a-46b9-4b21-9770-91b0328fc718" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 042624" src="https://github.com/user-attachments/assets/a617de51-2763-429a-8e82-fe9d5535067d" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 043649" src="https://github.com/user-attachments/assets/986dd3f4-c8d8-4444-b9a0-37c928d5021c" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 044318" src="https://github.com/user-attachments/assets/a6304085-2e25-4abe-b0c8-4da2d5361564" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 044117" src="https://github.com/user-attachments/assets/e763064d-dc44-45c3-a6d8-91e2c65031d2" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 044106" src="https://github.com/user-attachments/assets/de1cb6bd-5de8-4720-afbd-b574e80e4cde" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 044051" src="https://github.com/user-attachments/assets/e0027de3-83a0-482e-803f-5357f42a4bdd" />
<img width="1912" height="960" alt="Screenshot 2026-04-16 043853" src="https://github.com/user-attachments/assets/3f9d56d0-e7a3-4118-bc93-a9aa2c9809a8" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 043703" src="https://github.com/user-attachments/assets/75fb8e3c-7374-441f-9a86-8c21e38afcd6" />
<img width="1919" height="1079" alt="Screenshot 2026-04-16 043649" src="https://github.com/user-attachments/assets/a79b157b-a343-4f61-8633-048a136c9101" />

---

## 🚀 Key Innovation Pillars

### 🧠 Neural Intelligence Layer
- **Neural Concierge**: Context-aware AI chatbot built into the terminal to assist with inventory, revenue analysis, and performance metrics.
- **Strategic Upselling**: Real-time recommendation chip that suggests high-conversion item pairings during checkout.

### 🛡️ Institutional Accountability
- **Operational Audit Trail**: A searchable, time-stamped log of every bill generated, deleted, or inventory shift.
- **Dynamic Inventory**: Ingredient-based stock deduction system that tracks raw material consumption per SKU.

### 💎 Cinematic Engineering (UX)
- **Glassmorphism Design**: High-contrast, transparent UI components with coffee-toned gradients.
- **Micro-Animations**: State-driven feedback using Framer Motion for a fluid, premium feel.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts.
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data JPA.
- **Database**: MySQL.
- **Comm Protocol**: WebSockets (STOMP/SockJS) for real-time Kitchen Display (KDS) sync.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Java 17+
- Node.js 20+
- MySQL Server

### 2. Backend Setup
```bash
git clone https://github.com/tapan2004/smart-cafe-management-system.git
cd CafeManagementSystemApi
# Update application.properties with your DB credentials
mvn spring-boot:run
```

### 3. Frontend Setup
```bash
git clone https://github.com/tapan2004/cafeflow-pos-frontend.git
cd CafeManagementSystemFrontend
npm install
npm run dev
```

---

## 🏆 Functional Highlights
- **Dynamic QR Receipts**: Generates instant UPI QR codes on receipts for digital payments.
- **KDS Handshake**: Automated order routing to the Kitchen Monitor.
- **Revenue Pulse**: Visual analytics showing capital accumulation and sales trends.

---

## 👨‍💻 Author
**Tapan Manna**
- GitHub: [@tapan2004](https://github.com/tapan2004)
- Engineering: Full-Stack (Spring Boot & React)

---

> _"Building the future of hospitality, one node at a time."_
