from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/getUserProfile', methods=['GET'])
def get_user_profile():
    try:
        access_token = request.headers.get('Authorization').split()[1]
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get('https://api.spotify.com/v1/me', headers=headers)
        user_profile = response.json()
        return jsonify(user_profile)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)