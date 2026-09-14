import { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { addToWishlist, logUnmatchedSearch } from '../../utils/feedbackUtils';
import './AddToWishlistButton.css';

/**
 * Shows when search returns no results.
 * Allows user to add personality to wish list.
 * Also logs the unmatched search for analytics.
 */
export function AddToWishlistButton({ searchQuery }: { searchQuery: string }) {
  const user = useUserStore(state => state.profile);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToWishlist = async () => {
    if (!user || !user.id || !searchQuery) return;

    setIsLoading(true);

    try {
      // Log the unmatched search (demand signal)
      await logUnmatchedSearch(user.id, searchQuery);

      // Add to wish list
      await addToWishlist(user.id, searchQuery);

      setIsAdded(true);

      // Reset after 3 seconds
      setTimeout(() => setIsAdded(false), 3000);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdded) {
    return (
      <div className="wishlist-added-confirmation">
        ✓ We've noted your request for "{searchQuery}". Thanks!
      </div>
    );
  }

  return (
    <button
      className="add-to-wishlist-btn"
      onClick={handleAddToWishlist}
      disabled={isLoading}
    >
      + Add "{searchQuery}" to Wish List
    </button>
  );
}

export default AddToWishlistButton;
