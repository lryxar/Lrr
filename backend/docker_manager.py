import subprocess
from pathlib import Path


class DockerManager:
    def __init__(self, image_name: str = "discord-bot-runtime"):
        self.image_name = image_name

    def run_bot(self, bot_dir: Path, memory: str = "256m", cpus: str = "0.5") -> str:
        command = [
            "docker",
            "run",
            "-d",
            "--memory",
            memory,
            "--cpus",
            cpus,
            "-v",
            f"{bot_dir.resolve()}:/app",
            self.image_name,
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return result.stdout.strip()

    def stop_bot(self, container_id: str) -> None:
        subprocess.run(["docker", "stop", container_id], check=True)

    def get_logs(self, container_id: str) -> str:
        result = subprocess.run(
            ["docker", "logs", "--tail", "200", container_id],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout
