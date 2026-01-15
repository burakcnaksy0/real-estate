package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Message;
import com.burakcanaksoy.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

        // Get all messages between two users, ordered by creation time
        @Query("SELECT m FROM Message m WHERE " +
                        "(m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
                        "(m.sender.id = :userId2 AND m.receiver.id = :userId1) " +
                        "ORDER BY m.createdAt ASC")
        List<Message> findConversationBetweenUsers(@Param("userId1") Long userId1,
                        @Param("userId2") Long userId2);

        // Get all users that have conversations with the given user
        @Query("SELECT DISTINCT u FROM User u WHERE u.id IN (" +
                        "SELECT m.sender.id FROM Message m WHERE m.receiver.id = :userId " +
                        "UNION " +
                        "SELECT m.receiver.id FROM Message m WHERE m.sender.id = :userId)")
        List<User> findConversationParticipants(@Param("userId") Long userId);

        // Count unread messages for a user
        @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
        Long countUnreadMessages(@Param("userId") Long userId);

        // Find unread messages for a user
        List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);

        // Find messages sent by a user
        List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);

        // Find messages received by a user
        List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

        // Delete all messages where user is sender or receiver
        void deleteBySenderOrReceiver(User sender, User receiver);
}
