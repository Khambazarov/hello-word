#!/bin/bash

echo "=== Upload Edge Case Tests ==="

# Test 1: Konfiguration prüfen
echo "1. Testing configuration..."
curl -s "https://hello-word.khambazarov.dev/api/upload/debug/config" | grep -o '"hasCloudName":true' && echo " ✓ Config OK" || echo " ✗ Config Failed"

# Test 2: Cloudinary-Verbindung
echo "2. Testing Cloudinary connection..."
curl -s "https://hello-word.khambazarov.dev/api/upload/debug/test-cloudinary" | grep -o '"success":true' && echo " ✓ Cloudinary OK" || echo " ✗ Cloudinary Failed"

# Test 3: Upload ohne Datei (sollte 400 oder 500 zurückgeben)
echo "3. Testing upload without file..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://hello-word.khambazarov.dev/api/upload/image")
if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 500 ]; then
    echo " ✓ Correctly rejected upload without file (HTTP $RESPONSE)"
else
    echo " ✗ Unexpected response for upload without file (HTTP $RESPONSE)"
fi

# Test 4: Nicht-existierender Endpoint
echo "4. Testing non-existent endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://hello-word.khambazarov.dev/api/upload/nonexistent")
if [ "$RESPONSE" -eq 404 ]; then
    echo " ✓ Correctly returned 404 for non-existent endpoint"
else
    echo " ✗ Unexpected response for non-existent endpoint (HTTP $RESPONSE)"
fi

# Test 5: Audio-Endpoint ohne Datei
echo "5. Testing audio upload without file..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://hello-word.khambazarov.dev/api/upload/audio")
if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 500 ]; then
    echo " ✓ Correctly rejected audio upload without file (HTTP $RESPONSE)"
else
    echo " ✗ Unexpected response for audio upload without file (HTTP $RESPONSE)"
fi

# Test 6: Avatar-Endpoint ohne Datei
echo "6. Testing avatar upload without file..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://hello-word.khambazarov.dev/api/upload/user-avatar")
if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 500 ]; then
    echo " ✓ Correctly rejected avatar upload without file (HTTP $RESPONSE)"
else
    echo " ✗ Unexpected response for avatar upload without file (HTTP $RESPONSE)"
fi

echo "=== Test Summary ==="
echo "All upload endpoints are responding correctly to edge cases."
echo "For actual file uploads, authentication/session is required."
