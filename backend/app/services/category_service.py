from collections.abc import Mapping

CATEGORY_RULES: Mapping[str, tuple[str, ...]] = {
    "Food": ("market", "grocery", "migros", "a101", "bim", "carrefour", "restaurant", "coffee"),
    "Transportation": ("uber", "taxi", "fuel", "benzin", "metro", "bus", "otobus", "ulasim"),
    "Rent": ("rent", "kira"),
    "Utilities": ("electric", "water", "gas", "internet", "phone", "fatura", "dogalgaz"),
    "Shopping": ("amazon", "trendyol", "hepsiburada", "clothes", "shopping", "magaza"),
    "Entertainment": ("netflix", "spotify", "cinema", "sinema", "game", "theater"),
    "Health": ("pharmacy", "eczane", "hospital", "clinic", "doctor", "saglik"),
    "Education": ("course", "udemy", "book", "kitap", "school", "education", "egitim"),
    "Salary": ("salary", "maas", "payroll"),
}


class CategoryClassifier:
    """Rule-based classifier with a small interface that can later wrap an ML model."""

    def predict(self, description: str, transaction_type: str) -> str:
        lowered = description.lower()
        if transaction_type == "income":
            return "Salary" if self._matches(lowered, CATEGORY_RULES["Salary"]) else "Other"

        for category, keywords in CATEGORY_RULES.items():
            if category == "Salary":
                continue
            if self._matches(lowered, keywords):
                return category
        return "Other"

    @staticmethod
    def _matches(text: str, keywords: tuple[str, ...]) -> bool:
        return any(keyword in text for keyword in keywords)


classifier = CategoryClassifier()

