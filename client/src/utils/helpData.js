// src/data/helpData.js

export const helpData = [
  {
    id: "getting-started",
    title: "Getting Started",
    articles: [
      {
        id: "how-to-create-account",
        question: "How do I create an account?",
        answer:
          "Click the Create Account button on the login page, fill in your details, and submit. You'll receive a verification email."
      },
      {
        id: "first-steps",
        question: "What should I do first after logging in?",
        answer:
          "You should visit your dashboard, update your profile, and explore the initial setup checklist."
      }
    ]
  },
  {
    id: "project-management",
    title: "Project & Tasks",
    articles: [
      {
        id: "create-task",
        question: "How do I create a new task?",
        answer:
          "Go to the Tasks section, click the '+ New Task' button, fill the required fields, and save."
      },
      {
        id: "assign-users",
        question: "How do I assign users to a task?",
        answer:
          "Open the task editor and choose users from the Assigned To dropdown. You can assign multiple users."
      }
    ]
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    articles: [
      {
        id: "payment-methods",
        question: "What payment methods do you support?",
        answer:
          "We currently support credit cards, debit cards, and UPI-based payment options."
      },
      {
        id: "invoice",
        question: "Where can I download my invoice?",
        answer:
          "Go to Billing → Invoices and click Download next to the invoice you need."
      }
    ]
  }
];
