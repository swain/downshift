import { NextRequest, NextResponse } from "next/server";

interface TrackFoodRequest {
  foodId: string;
  foodName: string;
  amount: number;
  calories: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackFoodRequest = await request.json();
    
    const { foodId, foodName, amount, calories, timestamp } = body;
    
    if (!foodId || !foodName || amount <= 0 || calories <= 0) {
      return NextResponse.json(
        { error: "Invalid food data provided" },
        { status: 400 }
      );
    }
    
    console.log("Tracking food entry:", {
      foodId,
      foodName,
      amount,
      calories,
      timestamp,
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trackedEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      foodId,
      foodName,
      amount,
      calories,
      timestamp,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      entry: trackedEntry,
      message: `Successfully tracked ${amount} ${foodName} (${calories} calories)`,
    });
    
  } catch (error) {
    console.error("Error tracking food:", error);
    
    return NextResponse.json(
      { error: "Failed to track food entry" },
      { status: 500 }
    );
  }
}