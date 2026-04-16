# === test.py ===
import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Теперь импортируем aiogram
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

BOT_TOKEN = "8603177988:AAE9m6Soo8SGLTP-RhgC8pHcfHqVuGVeRn0"
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    await message.answer("Привет! 🤖")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())