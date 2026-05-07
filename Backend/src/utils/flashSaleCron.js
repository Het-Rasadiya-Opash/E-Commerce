import flashSaleModel from "../models/flashSale.model.js";
import { getIO } from "../socket.js";

export const startFlashSaleCron = () => {
  setInterval(async () => {
    try {
      const now = new Date();

      const activeResult = await flashSaleModel.updateMany(
        {
          status: "SCHEDULED",
          startTime: { $lte: now },
          isDeleted: false,
        },
        {
          $set: { status: "ACTIVE" },
        },
      );

      const endedResult = await flashSaleModel.updateMany(
        {
          status: "ACTIVE",
          endTime: { $lte: now },
          isDeleted: false,
        },
        {
          $set: { status: "ENDED" },
        },
      );

      if (activeResult.modifiedCount > 0 || endedResult.modifiedCount > 0) {
        console.log(
          `[FlashSaleCron] ${new Date().toISOString()} - Statuses updated: ${activeResult.modifiedCount} to ACTIVE, ${endedResult.modifiedCount} to ENDED`,
        );

        try {
          const io = getIO();
          io.emit("FLASH_SALE_STATUS_UPDATED", {
            activeCount: activeResult.modifiedCount,
            endedCount: endedResult.modifiedCount,
          });
        } catch (socketErr) {
          console.warn(
            "[FlashSaleCron] Socket notification failed:",
            socketErr.message,
          );
        }
      }
    } catch (error) {
      console.error(
        "[FlashSaleCron] Error updating flash sale statuses:",
        error,
      );
    }
  }, 10000);
};
