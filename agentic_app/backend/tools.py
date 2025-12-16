# Inventory Tool for Raju's Royal Artifacts

INVENTORY = {
    "brass lamp": {"price": 50, "cost": 30, "stock": 5},
    "silk scarf": {"price": 500, "cost": 300, "stock": 2},
    "sandalwood carving": {"price": 1000, "cost": 800, "stock": 1},
    "miniature taj mahal": {"price": 2000, "cost": 1500, "stock": 3},
    "marble elephant": {"price": 750, "cost": 400, "stock": 4},
    "pashmina shawl": {"price": 1500, "cost": 900, "stock": 2},
    "copper chai set": {"price": 300, "cost": 150, "stock": 6},
    "wooden chess set": {"price": 800, "cost": 500, "stock": 2},
}


def check_inventory(item_name: str) -> str:
    """
    Checks if an item is in stock and returns price.
    Use this tool when customer asks about any item or its price.

    Args:
        item_name: The name of the item to check

    Returns:
        Stock availability and price information
    """
    print(f"DEBUG: Checking inventory for '{item_name}'")
    item_lower = item_name.lower()

    # Search for partial match
    for key in INVENTORY:
        if key in item_lower or item_lower in key:
            data = INVENTORY[key]
            if data["stock"] > 0:
                return f"Yes! We have {key}. Price is {data['price']} coins. We have {data['stock']} in stock."
            else:
                return f"Arre, sorry! {key} is currently out of stock. Come back next week!"

    return "Sorry friend, I don't think we sell that. But ask me about brass lamps, silk scarves, sandalwood carvings, taj mahal miniatures, marble elephants, pashmina shawls, copper chai sets, or wooden chess sets!"


def list_all_items() -> str:
    """
    Lists all available items in the shop.
    Use this tool when customer wants to see what's available.

    Returns:
        List of all items with prices
    """
    print("DEBUG: Listing all items")
    items_list = []
    for item, data in INVENTORY.items():
        status = f"({data['stock']} in stock)" if data['stock'] > 0 else "(OUT OF STOCK)"
        items_list.append(f"- {item.title()}: {data['price']} coins {status}")

    return "Welcome to Raju's Royal Artifacts! Here's what we have:\n" + "\n".join(items_list)


def calculate_discount(item_name: str, discount_percent: int) -> str:
    """
    Calculates discounted price for an item.
    Use this tool only when agreeing to give discount (max 10%).

    Args:
        item_name: The name of the item
        discount_percent: Discount percentage (max 10)

    Returns:
        Discounted price information
    """
    print(f"DEBUG: Calculating {discount_percent}% discount for '{item_name}'")

    # Cap discount at 10%
    if discount_percent > 10:
        discount_percent = 10

    item_lower = item_name.lower()

    for key in INVENTORY:
        if key in item_lower or item_lower in key:
            data = INVENTORY[key]
            original_price = data["price"]
            discounted_price = original_price * (1 - discount_percent / 100)
            return f"Okay okay, FINAL price for {key}: {discounted_price:.0f} coins (was {original_price} coins). This is my BEST offer!"

    return "I cannot give discount on item I don't have, friend!"
