import { UserModel } from './models';

export async function checkPlan(email: string): Promise<boolean> {
  const user = await UserModel.findOne({ email });
  if (!user) return false;
  
  if (user.planActive) {
    return true;
  }
  
  return false;
}
