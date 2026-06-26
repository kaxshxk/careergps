from flask import Blueprint, render_template, jsonify, current_app
import requests

market_blueprint = Blueprint('market', __name__)

@market_blueprint.route('/get-market-trends', methods=['GET'])
def get_market_trends():
    """
    Route that fetches job market trends from an external API service.
    Handles connectivity and response failures by returning a 503 error page.
    """
    api_url = "https://api.externaljobs.com/v1/trends"
    
    try:
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except Exception as e:
        current_app.logger.error(f"Error in get_market_trends: {str(e)}")
        return jsonify(error="Service temporarily unavailable"), 503
