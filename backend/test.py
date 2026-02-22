"""
Test script to verify all API endpoints are working correctly
Run after starting the server with: uvicorn main:app --reload
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health check endpoint"""
    print("\n🧪 Testing /health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✅ Health check passed")
    return data

def test_get_all_heritage():
    """Test getting all heritage sites"""
    print("\n🧪 Testing /heritage endpoint...")
    response = requests.get(f"{BASE_URL}/heritage")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 50
    assert len(data["items"]) > 0
    print(f"✅ Found {data['total']} heritage sites")
    return data

def test_get_heritage_by_id():
    """Test getting specific heritage site"""
    print("\n🧪 Testing /heritage/1 endpoint...")
    response = requests.get(f"{BASE_URL}/heritage/1")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "district" in data
    print(f"✅ Found site: {data['name']}")
    return data

def test_filter_by_district():
    """Test filtering by district"""
    print("\n🧪 Testing filter by district (Madurai)...")
    response = requests.get(f"{BASE_URL}/heritage?district=Madurai")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    # Verify all returned sites are in Madurai
    for item in data["items"]:
        assert item["district"]["name"] == "Madurai"
    print(f"✅ Found {data['total']} sites in Madurai")
    return data

def test_filter_by_type():
    """Test filtering by heritage type"""
    print("\n🧪 Testing filter by type (Temple)...")
    response = requests.get(f"{BASE_URL}/heritage?type=Temple")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    # Verify all returned sites are temples
    for item in data["items"]:
        assert item["heritage_type"]["name"] == "Temple"
    print(f"✅ Found {data['total']} temples")
    return data

def test_filter_by_dynasty():
    """Test filtering by dynasty"""
    print("\n🧪 Testing filter by dynasty (Chola)...")
    response = requests.get(f"{BASE_URL}/heritage?dynasty=Chola")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    # Verify all returned sites are from Chola dynasty
    for item in data["items"]:
        if item["dynasty"]:
            assert item["dynasty"]["name"] == "Chola"
    print(f"✅ Found {data['total']} Chola heritage sites")
    return data

def test_unesco_filter():
    """Test UNESCO sites filter"""
    print("\n🧪 Testing UNESCO sites filter...")
    response = requests.get(f"{BASE_URL}/heritage?unesco_only=true")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5  # We have 5 UNESCO sites
    # Verify all are UNESCO sites
    for item in data["items"]:
        assert item["unesco_site"] == True
    print(f"✅ Found {data['total']} UNESCO World Heritage Sites")
    return data

def test_combined_filters():
    """Test combined filters"""
    print("\n🧪 Testing combined filters (Thanjavur + Temple + Chola)...")
    response = requests.get(f"{BASE_URL}/heritage?district=Thanjavur&type=Temple&dynasty=Chola")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    print(f"✅ Found {data['total']} sites matching all filters")
    return data

def test_get_districts():
    """Test getting all districts"""
    print("\n🧪 Testing /districts endpoint...")
    response = requests.get(f"{BASE_URL}/districts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    print(f"✅ Found {len(data)} districts")
    return data

def test_get_types():
    """Test getting all heritage types"""
    print("\n🧪 Testing /types endpoint...")
    response = requests.get(f"{BASE_URL}/types")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    print(f"✅ Found {len(data)} heritage types")
    for t in data:
        print(f"   • {t['name']}")
    return data

def test_get_dynasties():
    """Test getting all dynasties"""
    print("\n🧪 Testing /dynasties endpoint...")
    response = requests.get(f"{BASE_URL}/dynasties")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    print(f"✅ Found {len(data)} dynasties")
    for d in data:
        print(f"   • {d['name']}")
    return data

def test_statistics():
    """Test statistics endpoint"""
    print("\n🧪 Testing /stats endpoint...")
    response = requests.get(f"{BASE_URL}/stats")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert data["summary"]["total_sites"] == 50
    assert data["summary"]["unesco_sites"] == 5
    print("✅ Statistics:")
    print(f"   • Total Sites: {data['summary']['total_sites']}")
    print(f"   • UNESCO Sites: {data['summary']['unesco_sites']}")
    print(f"   • Districts: {data['summary']['total_districts']}")
    print(f"   • Types: {data['summary']['total_types']}")
    print(f"   • Dynasties: {data['summary']['total_dynasties']}")
    return data

def test_search():
    """Test search functionality"""
    print("\n🧪 Testing /search endpoint...")
    response = requests.get(f"{BASE_URL}/search?q=temple")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    print(f"✅ Search found {data['count']} results for 'temple'")
    return data

def test_pagination():
    """Test pagination"""
    print("\n🧪 Testing pagination...")
    response = requests.get(f"{BASE_URL}/heritage?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["page"] == 1
    print(f"✅ Pagination working: Page {data['page']}, {data['page_size']} items")
    return data

def run_all_tests():
    """Run all tests"""
    print("="*60)
    print("🚀 RUNNING API TESTS")
    print("="*60)
    
    try:
        test_health()
        test_get_all_heritage()
        test_get_heritage_by_id()
        test_filter_by_district()
        test_filter_by_type()
        test_filter_by_dynasty()
        test_unesco_filter()
        test_combined_filters()
        test_get_districts()
        test_get_types()
        test_get_dynasties()
        test_statistics()
        test_search()
        test_pagination()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n🎉 Your API is working perfectly!")
        print("📍 View Swagger docs at: http://127.0.0.1:8000/docs")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server")
        print("Make sure the server is running with: uvicorn main:app --reload")
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    run_all_tests()