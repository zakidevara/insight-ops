package com.insightops.batch;

import com.insightops.model.PostMortem;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JpaPagingItemReaderBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ReIndexJobConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final EntityManagerFactory entityManagerFactory;
    private final JdbcTemplate jdbcTemplate;

    @Bean
    public Job reIndexPostmortemsJob(Step clearVectorStoreStep, Step reIndexStep) {
        return new JobBuilder("reIndexPostmortemsJob", jobRepository)
                .start(clearVectorStoreStep)
                .next(reIndexStep)
                .build();
    }

    @Bean
    public Step clearVectorStoreStep() {
        Tasklet truncate = (contribution, chunkContext) -> {
            int deleted = jdbcTemplate.update("DELETE FROM vector_store");
            log.info("[ReIndex] Cleared {} documents from vector_store", deleted);
            return RepeatStatus.FINISHED;
        };
        return new StepBuilder("clearVectorStoreStep", jobRepository)
                .tasklet(truncate, transactionManager)
                .build();
    }

    @Bean
    public Step reIndexStep(PostMortemDocumentProcessor processor, VectorStoreItemWriter writer) {
        JpaPagingItemReader<PostMortem> reader = new JpaPagingItemReaderBuilder<PostMortem>()
                .name("postMortemReader")
                .entityManagerFactory(entityManagerFactory)
                .queryString("SELECT p FROM PostMortem p ORDER BY p.createdAt ASC")
                .pageSize(10)
                .build();

        return new StepBuilder("reIndexStep", jobRepository)
                .<PostMortem, List<Document>>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }
}
