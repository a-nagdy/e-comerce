import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/products/suggestions/feedback - Record user feedback for learning
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            inputText,
            suggestedCatalogId,
            userChoice, // true = accepted, false = rejected
            actualCatalogId, // what they actually chose (if rejected)
            confidenceScore,
            categoryId
        } = body;

        console.log('Recording feedback:', {
            inputText,
            suggestedCatalogId,
            userChoice,
            actualCatalogId,
            confidenceScore,
            categoryId,
            userId: user.id
        });

        // Record feedback for machine learning
        const { error: feedbackError } = await supabase
            .from('product_match_feedback')
            .insert({
                input_text: inputText,
                suggested_catalog_id: suggestedCatalogId,
                user_choice: userChoice,
                actual_catalog_id: actualCatalogId,
                confidence_score: confidenceScore,
                user_id: user.id,
                category_id: categoryId
            });

        if (feedbackError) {
            console.error("Error recording feedback:", feedbackError);
            return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
        }

        console.log('Feedback recorded successfully');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error in feedback API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
