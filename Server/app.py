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
    
@app.route('/createPlaylist', methods=['POST'])
def create_playlist():
    request_data = request.json
    user_id = request_data.get('user_id')
    playlist_data = request_data.get('playlist_data')
    access_token = request.headers.get('Authorization').split()[1]
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.post(f'https://api.spotify.com/v1/users/{user_id}/playlists', 
        json=playlist_data, headers=headers)
    if response.status_code == 201:
        return jsonify({'message': 'Playlist created successfully'})
    else:
        return jsonify({'error': 'Failed to create playlist'})

if __name__ == '__main__':
    app.run(debug=True)