from flask import Blueprint, render_template, jsonify, current_app
from extensions import limiter

market_blueprint = Blueprint('market', __name__)

@market_blueprint.route('/get-market-trends', methods=['GET'])
@limiter.limit("30 per minute")
def get_market_trends():
    """
    Route that returns mock job market trends.
    """
    # Return high-fidelity mock data directly so the frontend doesn't receive a 503 error
    mock_data = {
        "status": "success",
        "last_updated": "2026-06-29",
        "trends": [
            {
                "role": "Software Engineer",
                "demand": "High",
                "growth_rate": "15%",
                "top_skills": ["Python", "JavaScript", "React", "Docker"],
                "avg_salary_inr": "12,00,000"
            },
            {
                "role": "Data Scientist",
                "demand": "Very High",
                "growth_rate": "22%",
                "top_skills": ["Python", "Machine Learning", "SQL", "Pandas"],
                "avg_salary_inr": "15,00,000"
            },
            {
                "role": "Cloud Architect",
                "demand": "High",
                "growth_rate": "18%",
                "top_skills": ["AWS", "Kubernetes", "Terraform", "Linux"],
                "avg_salary_inr": "18,00,000"
            },
            {
                "role": "Product Manager",
                "demand": "Medium-High",
                "growth_rate": "10%",
                "top_skills": ["Product Strategy", "Agile", "User Research", "SQL"],
                "avg_salary_inr": "16,00,000"
            }
        ]
    }
    return jsonify(mock_data)
