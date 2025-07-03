# **App Name**: GymFlow

## Core Features:

- Secure Authentication: User authentication with email/password and Google login using Firebase Auth, offering distinct profiles for students, staff, and administrators. Utilizes Firebase Authentication for secure and scalable user management.
- Profile Management: A well-designed form to collect necessary data for students and staff including name, ID, birth date, contact info, plan details, and expiration date, with the ability to upload photos to Firebase Storage. Leverages Firebase Storage for efficient media management.
- Workout Tracking: An exercise sheet entry system where trainers input the exercise list including reps, series, and notes, providing the exercise history with dates. Integrates with Firestore for data storage and retrieval.
- Access Control: System simulating turnstile/catraca entry access control which has a single endpoint that indicates whether the student is allowed in depending on whether their payments are up to date. Implemented using Firebase Functions for real-time logic and Firestore for payment status.
- Admin Dashboard: Admin panel with main information at a glance such as active students, overdue accounts, accesses, and also generating comparison graphs on the dashboard to visualize payments, presence, and academy growth. Built with React.js and utilizes Chart.js or Recharts for data visualization, backed by Firestore data.
- AI-Powered Workout Suggestions: A generative AI tool will send personalized workout recommendations to students based on their workout history and goals. Students will be prompted with tailored workout advice. It is a tool that decides when to provide workout advice based on factors such as workout frequency and adherence to fitness goals.
- Multi-Tenant Support: System to manage different gym locations, each with its own set of data (students, staff, plans, etc.). Uses Firestore's hierarchical data structure to separate data between gyms.
- Custom Plan Creation: Allows the creation of custom workout plans (e.g., strength training, CrossFit, yoga) with different pricing. The plans are stored in Firestore.
- Automated Notifications: Sends automatic reminders to students via email or WhatsApp about upcoming payment due dates. This leverages Firebase Functions and a third-party messaging service (e.g., Twilio, SendGrid).
- Responsive Application: Responsive design ensures the application is accessible and functional on various devices (desktops, tablets, smartphones) for both students and staff. Built using React.js and TailwindCSS for a modern and responsive UI.
- Integrated Payment Processing: Integrates with payment gateways like Stripe or MercadoPago to handle subscription payments, process refunds, and manage payment methods. Uses Firebase Functions to securely handle payment webhooks.
- Invoice Generation: Generates PDF invoices/receipts for payments, which are stored in Firebase Storage and accessible to both students and admins. Utilizes a PDF generation library in Firebase Functions to create and store the documents.
- Printable Workout Plans: Allows trainers to create workout plans for students that can be printed for easy access.
- WhatsApp CRM Integration: Sends personalized messages to students via WhatsApp for birthdays or to encourage them to return to the gym. This CRM functionality enhances student engagement.
- Physical Assessment Tracking: Stores and manages physical assessment data for each student, allowing trainers to track progress and tailor workout plans.
- On-the-Spot Staff Login Creation: Allows for the immediate creation of login credentials for staff members for administrative access.
- Specialized Access for Financial and Secretarial Staff: Provides a specialized access point for financial and secretarial staff to manage cash flow and create new member registrations.

## Style Guidelines:

- The app allows users to define the primary color to convey energy and sophistication in fitness. Uses a color picker component for customization.
- Users can customize the background color, providing a calm, clean backdrop that keeps the primary grounded. A soft lavender (#E6E0EB) is the default.
- Users can customize the accent color which will provide a techy counterpoint, as well as added visual interest. Muted blue (#6CA0D5) is the default.
- Font pairing: 'Space Grotesk' (sans-serif) for headings to communicate the technological aspect, paired with 'Inter' (sans-serif) for body text, since the content is detailed. Allow customization of the font family.
- Use modern, minimalist icons to represent different features and workout categories. The icon set is customizable.
- Smooth transitions and subtle animations to enhance user engagement and provide feedback. Users can control the intensity of the animations.