import sqlite3

# Function to delete multiple video entries in a single query
def delete_multiple_videos_batch(database_path, video_ids):
    """
    Deletes multiple video entries from the SQLite database in a single query.

    :param database_path: Path to the SQLite database file.
    :param video_ids: List of video IDs to delete.
    """
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        # Create a parameterized query to delete all videos in one go
        query = "DELETE FROM shared_links WHERE id IN ({})".format(",".join(["?"] * len(video_ids)))
        cursor.execute(query, video_ids)

        # Commit the transaction
        conn.commit()
        print(f"Deleted {cursor.rowcount} videos.")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the connection
        if conn:
            conn.close()

# Example usage
if __name__ == "__main__":
    # Path to the SQLite database
    database_path = "database.sqlite"  # Replace with your database path

    # List of video IDs to delete
    video_ids = [
        "123e4567-e89b-12d3-a456-426614174000",
        "b23e4567-e89b-12d3-a456-426614174001",
        "c23e4567-e89b-12d3-a456-426614174002"
        # Add more video IDs here
    ]

    # Call the function to delete the videos
    delete_multiple_videos_batch(database_path, video_ids)
