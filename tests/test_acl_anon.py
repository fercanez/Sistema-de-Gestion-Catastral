"""
Pruebas minimas de ACL sin credenciales ni base de datos (BT-019).

Ejecutar desde la raiz del proyecto:
  python -m unittest tests.test_acl_anon -v

Requiere variables de entorno minimas para importar config (se establecen abajo si faltan).
"""
from __future__ import annotations

import os
import unittest

os.environ.setdefault("SECRET_KEY", "smoke-test-secret-key-" + ("x" * 48))
os.environ.setdefault("DB_HOST", "127.0.0.1")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "catastro_test")
os.environ.setdefault("DB_USER", "catastro")
os.environ.setdefault("DB_PASSWORD", "test")

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


client = TestClient(app)


class TestACLAnonymous(unittest.TestCase):
    def test_root_publico(self):
        r = client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json().get("estado"), "operando")

    def test_documentos_requieren_auth(self):
        r = client.get("/documentos/000000/ejemplo.pdf")
        self.assertEqual(r.status_code, 401)

    def test_tiles_requieren_auth(self):
        r = client.get("/tiles/predios/0/0/0.pbf")
        self.assertEqual(r.status_code, 401)

    def test_ficha_requiere_auth(self):
        r = client.get("/padron/000000/ficha")
        self.assertEqual(r.status_code, 401)

    def test_me_requiere_auth(self):
        r = client.get("/me")
        self.assertEqual(r.status_code, 401)

    def test_movimientos_version_publica(self):
        r = client.get("/movimientos/aplicar-version")
        self.assertEqual(r.status_code, 200)
        self.assertIn("version", r.json())


if __name__ == "__main__":
    unittest.main()
