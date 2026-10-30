// Small constants for the student dashboard. The real content (research, categories,
// notifications ...) comes from the backend through the services in src/services.

import { heroResearch } from "../../../utils/categoryImage";

export { heroResearch };

// Icons next to the category shortcuts (decorative; categories themselves come from the API).
export const CATEGORY_ICONS = ["⌘", "✦", "♢", "▥", "◈", "❖"];

// Tabs of "My uploads". The backend statuses are upper-case (PENDING, APPROVED, REJECTED).
export const UPLOAD_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
