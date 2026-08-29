import copy
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.demo_data import DEMO
from app.main import app


class ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self._demo_snapshot = copy.deepcopy(DEMO)
        self._init_patch = patch("app.main.init_database", return_value=False)
        self._refresh_patch = patch("app.main.database.refresh_database_available", return_value=False)
        self._init_patch.start()
        self._refresh_patch.start()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self) -> None:
        self.client.__exit__(None, None, None)
        self._refresh_patch.stop()
        self._init_patch.stop()
        DEMO.clear()
        DEMO.update(copy.deepcopy(self._demo_snapshot))

    def test_health_reports_demo_mode_when_database_is_down(self) -> None:
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["database"], "demo")
        self.assertFalse(payload["database_reachable"])

    def test_root_serves_application_shell(self) -> None:
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("IGS Restaurant PRO", response.text)

    def test_delivery_quote_calculates_total(self) -> None:
        response = self.client.get("/api/delivery/quote", params={"district": "Centro", "order_total": 100.50})

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["district"], "Centro")
        self.assertEqual(payload["delivery_fee"], 10.0)
        self.assertEqual(payload["total"], 110.5)

    def test_delivery_quote_rejects_unknown_district(self) -> None:
        response = self.client.get("/api/delivery/quote", params={"district": "Bairro Inexistente", "order_total": 10})

        self.assertEqual(response.status_code, 404)

    def test_update_order_status_rejects_unknown_ticket(self) -> None:
        response = self.client.post("/api/orders/UNKNOWN/status/ready")

        self.assertEqual(response.status_code, 404)

    def test_update_order_status_validates_status_enum(self) -> None:
        response = self.client.post("/api/orders/M01-148/status/anything")

        self.assertEqual(response.status_code, 422)

    def test_update_order_status_updates_known_ticket(self) -> None:
        response = self.client.post("/api/orders/M01-148/status/cancelled")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["order"]["status"], "cancelled")

    def test_cep_lookup_normalizes_masks(self) -> None:
        response = self.client.get("/api/ceps/35164-000")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["cep"], "35164000")


if __name__ == "__main__":
    unittest.main()
