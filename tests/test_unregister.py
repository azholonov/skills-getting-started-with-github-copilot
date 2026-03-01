def test_unregister_success(client):
    email = "daniel@mergington.edu"
    activity = "Chess Club"
    # Ensure signed up
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert f"Removed {email}" in response.json()["message"]


def test_unregister_not_registered(client):
    email = "notregistered@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]


def test_unregister_invalid_activity(client):
    email = "someone@mergington.edu"
    activity = "Nonexistent Club"
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
