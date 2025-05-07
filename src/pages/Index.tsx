
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserProfileData = {
  id: string;
  name: string;
  email: string;
};

const Index = () => {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch the user data from the users table
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
          } else {
            setUserData(data as UserProfileData);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Your Account Space</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Loading your profile...</p>
            </div>
          ) : userData ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border-b pb-2">
                    <span className="font-medium">Name:</span> {userData.name}
                  </div>
                  <div className="border-b pb-2">
                    <span className="font-medium">Email:</span> {userData.email}
                  </div>
                  <div className="border-b pb-2">
                    <span className="font-medium">Account ID:</span> <span className="text-xs text-gray-500">{userData.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => signOut()} 
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p>Unable to load user data. You might need to sign in again.</p>
              <Button 
                onClick={() => signOut()} 
                className="mt-4"
              >
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
