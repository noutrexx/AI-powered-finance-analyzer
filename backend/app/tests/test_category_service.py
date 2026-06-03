from app.services.category_service import classifier


def test_rule_based_category_classification() -> None:
    assert classifier.predict("Migros weekly grocery", "expense") == "Food"
    assert classifier.predict("Uber ride to airport", "expense") == "Transportation"
    assert classifier.predict("Spotify family plan", "expense") == "Entertainment"
    assert classifier.predict("Salary April", "income") == "Salary"

