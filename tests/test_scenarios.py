import pytest
from wildheads import schemas

@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to WildHeads HRM API"}

@pytest.mark.asyncio
async def test_auth_and_roles(client):
    # 1. Register a generic patient
    register_data = {
        "email": "patient@example.com",
        "password": "password123",
        "full_name": "John Doe",
        "patient_profile": {
            "dob": "1990-01-01T00:00:00",
            "gender": "Male",
            "phone": "1234567890"
        }
    }
    response = await client.post("/patients/register", json=register_data)
    assert response.status_code == 201
    patient_data = response.json()
    assert "id" in patient_data
    assert "user_id" in patient_data
    
    # 2. Login as Patient
    login_data = {"username": "patient@example.com", "password": "password123"}
    response = await client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None
    
    # 3. Create Admin (Seed logic usually, but here manually via direct DB or hack)
    # Since we can't register admin via API, we might need to insert one directly in test using db_session
    # Ideally, we should have a seed fixture, but let's try to bypass or test other things first.
    # Wait, we need admin to create doctors.
    # Let's create an admin user directly for testing purposes.
    pass

@pytest.mark.asyncio
async def test_full_medical_flow(client, db_session):
    # --- SETUP: Create Admin directly ---
    from wildheads.models import User
    from wildheads.core.security import get_password_hash
    
    admin_user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Super Admin",
        role="admin"
    )
    db_session.add(admin_user)
    await db_session.commit()
    
    # Login Admin
    response = await client.post("/auth/login", data={"username": "admin@example.com", "password": "admin123"})
    assert response.status_code == 200
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # --- STEP 1: Admin Create Department ---
    # We missed the department endpoint in Admin, but Doctor needs department_id.
    # Let's assume one exists or create via DB.
    # Use DepartmentService or direct DB.
    from wildheads.models import Department
    dept = Department(name="Cardiology", location="Block A")
    db_session.add(dept)
    await db_session.commit()
    await db_session.refresh(dept)
    dept_id = dept.id
    
    # --- STEP 2: Admin Creates Doctor ---
    doctor_payload = {
        "user_data": {
            "email": "doctor@example.com",
            "password": "docpass",
            "full_name": "Dr. House"
        },
        "doctor_profile": {
            "specialization": "Cardiologist",
            "consultation_fee": 5000
        },
        "department_id": dept_id
    }
    
    # The endpoint expects:
    # Body: user_data, doctor_profile
    # Query: department_id
    # Wait, create_doctor in admin.py was:
    # async def create_doctor(user_data, doctor_profile, department_id, ...)
    # If they are all body params without 'Body' embed, FastAPI might get confused if Pydantic models are mixed.
    # Let's check admin.py signature. 
    # create_doctor(user_data: schemas.UserCreate, doctor_profile: schemas.DoctorBase, department_id: int, ...)
    # FastAPI interprets multiple Pydantic models as body keys if not specified otherwise.
    # Usually: { "user_data": {...}, "doctor_profile": {...} }
    # Query params: department_id
    
    response = await client.post(
        f"/admin/users/doctor?department_id={dept_id}",
        json={
            "user_data": {
                "email": "doctor@example.com",
                "password": "docpass",
                "full_name": "Dr. House"
            },
            "doctor_profile": {
                "specialization": "Cardiologist",
                "consultation_fee": 5000
            }
        },
        headers=admin_headers
    )
    # If this fails with 422, it's the body structure.
    # Actually FastAPI merges body fields if not embedded? No, multiple body params -> embedded in JSON keys matching param names.
    assert response.status_code == 200, f"Error: {response.text}"
    doctor_data = response.json()
    assert doctor_data["email"] == "doctor@example.com"
    assert doctor_data["role"] == "doctor"
    
    # --- STEP 3: Admin Creates Nurse ---
    response = await client.post(
        "/admin/users/nurse",
        json={
            "email": "nurse@example.com",
            "password": "nursepass",
            "full_name": "Nurse Joy"
        },
        headers=admin_headers
    )
    assert response.status_code == 200
    
    # Login as Doctor
    resp = await client.post("/auth/login", data={"username": "doctor@example.com", "password": "docpass"})
    doc_token = resp.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}
    
    # Login as Nurse
    resp = await client.post("/auth/login", data={"username": "nurse@example.com", "password": "nursepass"})
    nurse_token = resp.json()["access_token"]
    nurse_headers = {"Authorization": f"Bearer {nurse_token}"}
    
    # --- STEP 4: Register Patient (Self Register) ---
    pat_reg = {
        "email": "sickpatient@example.com",
        "password": "sickpass",
        "full_name": "Sick Patient",
        "patient_profile": {
            "dob": "1980-05-20T00:00:00",
            "gender": "Female"
        }
    }
    resp = await client.post("/patients/register", json=pat_reg)
    assert resp.status_code == 201
    patient_id = resp.json()["id"]
    
    # --- STEP 5: Nurse Enters Vitals ---
    vitals_payload = {
        "patient_id": patient_id,
        "bp_systolic": 150, # High BP
        "bp_diastolic": 95,
        "heart_rate": 88,
        "temperature": 37.5,
        "oxygen_level": 98,
        "notes": "Patient complains of headache"
    }
    resp = await client.post("/vitals/", json=vitals_payload, headers=nurse_headers)
    assert resp.status_code == 200
    assert resp.json()["bp_systolic"] == 150
    
    # --- STEP 6: Doctor Analyzes Patient ---
    # Mock the AI Orchestrator to avoid real API calls during tests
    from unittest.mock import AsyncMock, patch
    
    # Mock data strictly following the AIOrchestrator output format
    mock_ai_result = {
        "risk_level": "High",
        "confidence": 0.88,
        "possible_causes": [{"cause": "Hypertension", "probability": 0.9}],
        "risk_prediction": "Stroke risk",
        "future_problems": ["Heart Failure"],
        "recommendations": ["Reduce salt"]
    }

    with patch("wildheads.services.ai_orchestrator.AIOrchestrator.doctor_analysis", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = mock_ai_result
        
        # Doctor calls AI with symptoms
        ai_payload = ["Headache", "Dizziness"]
        resp = await client.post(
            f"/ai/analyze/{patient_id}", 
            json=ai_payload,
            headers=doc_headers
        )
        assert resp.status_code == 200
        ai_result = resp.json()
        assert ai_result["risk_level"] == "High"
        assert "Hypertension" in ai_result["possible_causes"]

    # --- STEP 7: Patient Chat (New) ---
    with patch("wildheads.services.ai_orchestrator.AIOrchestrator.patient_chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = "This is a safe AI response."
        
        chat_payload = {"message": "I have a cold", "history": []}
        resp = await client.post("/ai/chat", json=chat_payload, headers=doc_headers) # Using doc token but patient can access too
        assert resp.status_code == 200
        assert resp.json()["reply"] == "This is a safe AI response."
    
    # --- STEP 8: Security Log Check ---
    # Simulate Attack
    resp = await client.post("/admin/security/simulate-attack", headers=admin_headers)
    assert resp.status_code == 200
    
    # View Logs
    resp = await client.get("/admin/security/logs", headers=admin_headers)
    assert resp.status_code == 200
    logs = resp.json()
    assert len(logs) > 0
    assert logs[0]["status"] == "BLOCKED"

