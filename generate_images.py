import os
import sys
import argparse
from io import BytesIO

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: The 'google-genai' package is not installed.")
    print("Please install it using: pip install google-genai")
    sys.exit(1)

# List of all catalog and brand assets with their corresponding prompts and target save paths
IMAGE_ASSETS = {
    # 1. Brand & UI Elements
    "logo_icon": {
        "path": "images/logo_icon.png",
        "prompt": "Sleek minimalist industrial logo featuring stylized steel beams forming geometric shapes, metallic silver and electric blue on dark background, premium 3d render"
    },
    "logo_premium": {
        "path": "images/logo_premium.png",
        "prompt": "Luxury minimalist corporate logo for a modern industrial steel trading company, embossed silver and platinum emblem, dark slate textures, elegant composition"
    },
    "404_bg": {
        "path": "industrial_404_bg_1778612131862.png",
        "prompt": "Cinematic dark industrial warehouse interior, moody atmospheric lighting, steel structures disappearing into shadows, blue volumetric light"
    },
    # 2. Product Category Images (real directory)
    "armatura": {
        "path": "images/products/real/armatura_gen.png",
        "prompt": "Close up macro photography of steel rebar texture, dramatic rim lighting, dark moody industrial background, high contrast metallic reflections"
    },
    "balka": {
        "path": "images/products/real/beams_realistic_1_1779883702409.png",
        "prompt": "Heavy steel I-beams stacked in a modern warehouse, cinematic blue and amber lighting, photorealistic industrial metal textures, depth of field"
    },
    "shveller": {
        "path": "images/products/real/channel_realistic_1_1779883730333.png",
        "prompt": "Steel channel U-bars neatly arranged in stacks, metallic surface reflecting cool studio lights, premium industrial catalog photography, dark mode style"
    },
    "profnastil": {
        "path": "images/products/real/corrugated_realistic_1_1779883763240.png",
        "prompt": "Stack of high-quality corrugated metal sheets, metallic pink and slate highlights reflecting light, realistic industrial warehouse product shot, cinematic macro"
    },
    "ugolok": {
        "path": "images/products/real/ugolok_gen.png",
        "prompt": "Steel angle L-bars in a row, sharp metallic edges catching bright highlights against a dark shadowy background, premium industrial product photography"
    },
    # 3. News Images
    "news_1": {
        "path": "images/news_1.png",
        "prompt": "Futuristic steel manufacturing plant, glowing hot metal, sparks flying, modern industrial technology, cinematic wide shot, highly detailed"
    },
    "news_2": {
        "path": "images/news_2.png",
        "prompt": "High tech quality control of steel products, blue laser scanning a metal beam, dark futuristic industrial environment, macro detail"
    }
}

def get_client():
    # Fetch key from env variables as per requirements
    api_key = os.environ.get("NANOBANANA_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("YOUR_API_KEY")
    if not api_key:
        print("Error: API key not found in environment variables.")
        print("Please set the 'NANOBANANA_API_KEY' environment variable and try again.")
        sys.exit(1)
    
    # Initialize the genai Client with key
    return genai.Client(api_key=api_key)

def generate_asset(client, name, asset_info, model_name="nano-banana-pro"):
    prompt = asset_info["prompt"]
    target_path = asset_info["path"]
    
    print(f"\nGenerating asset '{name}'...")
    print(f"Prompt: {prompt}")
    print(f"Target Path: {target_path}")
    
    # Ensure parent directory exists
    parent_dir = os.path.dirname(target_path)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir, exist_ok=True)
        print(f"Created directory: {parent_dir}")
        
    try:
        # Call Google GenAI Text-to-Image models API
        response = client.models.generate_images(
            model=model_name,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/png" if target_path.endswith(".png") else "image/jpeg"
            )
        )
        
        # Save the returned image
        if not response.generated_images:
            print(f"Error: No images were generated for '{name}'")
            return False
            
        for generated_image in response.generated_images:
            # Handle PIL image output or bytes depending on SDK version
            image = generated_image.image
            if hasattr(image, "save"):
                image.save(target_path)
            else:
                # Fallback if image contains raw bytes
                with open(target_path, "wb") as f:
                    f.write(image)
                    
        print(f"✓ Successfully generated and saved to: {target_path}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to generate '{name}': {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Generate premium industrial catalog images using google-genai SDK.")
    parser.add_argument("--image", choices=list(IMAGE_ASSETS.keys()), help="Name of the specific image asset to generate.")
    parser.add_argument("--all", action="store_true", help="Generate all assets outlined in the plan.")
    parser.add_argument("--list", action="store_true", help="List all available assets and prompts.")
    parser.add_argument("--model", default="nano-banana-pro", help="Model identifier to use (default: nano-banana-pro).")
    
    args = parser.parse_args()
    
    if args.list:
        print("\nAvailable Image Assets:")
        for name, info in IMAGE_ASSETS.items():
            print(f"- {name} ({info['path']})")
            print(f"  Prompt: \"{info['prompt']}\"")
        return

    if not args.image and not args.all:
        parser.print_help()
        return

    client = get_client()
    
    if args.image:
        generate_asset(client, args.image, IMAGE_ASSETS[args.image], model_name=args.model)
    elif args.all:
        print(f"Starting generation of {len(IMAGE_ASSETS)} assets using model '{args.model}'...")
        success_count = 0
        for name, info in IMAGE_ASSETS.items():
            if generate_asset(client, name, info, model_name=args.model):
                success_count += 1
        print(f"\nCompleted: {success_count}/{len(IMAGE_ASSETS)} assets generated successfully.")

if __name__ == "__main__":
    main()
