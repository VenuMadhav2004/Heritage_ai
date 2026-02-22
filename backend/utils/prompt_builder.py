class PromptBuilder:
    """
    Build prompts for Gemini AI based on heritage data
    """
    
    @staticmethod
    def build_story_prompt(heritage_data: dict) -> str:
        """
        Build a prompt for generating a historical story
        """
        name = heritage_data.get('name', '')
        period = heritage_data.get('period', '')
        description = heritage_data.get('description', '')
        
        prompt = f"""
        You are a knowledgeable tour guide in Tamil Nadu, India.
        
        Create an engaging 2-3 minute historical narrative about {name}.
        
        Details:
        - Historical Period: {period}
        - Description: {description}
        
        Requirements:
        - Start with a captivating opening
        - Include historical facts and dates
        - Mention architectural features
        - Add interesting anecdotes or legends
        - Conclude with its significance today
        - Keep it conversational and engaging
        - Target length: 250-300 words
        
        Write in a warm, storytelling tone suitable for tourists.
        """
        
        return prompt
    
    @staticmethod
    def build_fun_facts_prompt(heritage_data: dict) -> str:
        """
        Build a prompt for generating fun facts
        """
        name = heritage_data.get('name', '')
        
        prompt = f"""
        Generate 5 interesting and lesser-known fun facts about {name}.
        
        Make them:
        - Surprising and engaging
        - Historically accurate
        - Easy to remember
        - Suitable for social media sharing
        
        Format as a numbered list.
        """
        
        return prompt
    
    @staticmethod
    def build_visitor_guide_prompt(heritage_data: dict) -> str:
        """
        Build a prompt for visitor information
        """
        name = heritage_data.get('name', '')
        location = heritage_data.get('location', '')
        
        prompt = f"""
        Create a practical visitor's guide for {name} in {location}.
        
        Include:
        - Best time to visit
        - How to reach (from nearest city)
        - What to see (key highlights)
        - Photography tips
        - Nearby attractions
        - Local food recommendations
        
        Keep it concise and actionable.
        """
        
        return prompt

prompt_builder = PromptBuilder()