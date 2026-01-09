package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.WorkplaceCreateRequest;
import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;
import com.burakcanaksoy.realestate.request.WorkplaceUpdateRequest;
import com.burakcanaksoy.realestate.response.WorkplaceResponse;
import com.burakcanaksoy.realestate.service.WorkplaceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workplaces")
public class WorkplaceController {
    private final WorkplaceService workplaceService;

    public WorkplaceController(WorkplaceService workplaceService){
        this.workplaceService = workplaceService;
    }

    @GetMapping()
    public ResponseEntity<List<WorkplaceResponse>> getAllWorkplaces(){
        return new ResponseEntity<>(this.workplaceService.getAllWorkplaces(), HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<WorkplaceResponse>> getAllWorkplacePage(Pageable pageable){
        return new ResponseEntity<>(this.workplaceService.getAllWorkplaces(pageable),HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<WorkplaceResponse>> searchWorkplaces(@ModelAttribute WorkplaceFilterRequest filter, Pageable pageable){
        return new ResponseEntity<>(this.workplaceService.search(filter, pageable), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<WorkplaceResponse> createWorkplace(@RequestBody @Valid WorkplaceCreateRequest workplaceCreateRequest){
        return new ResponseEntity<>(this.workplaceService.createWorkplace(workplaceCreateRequest),HttpStatus.CREATED);
    }

    @GetMapping("/{workplaceId}")
    public ResponseEntity<WorkplaceResponse> getWorkplaceById(@PathVariable Long workplaceId){
        return new ResponseEntity<>(this.workplaceService.getWorkplaceById(workplaceId),HttpStatus.OK);
    }

    @DeleteMapping("/{workplaceId}")
    public ResponseEntity<String> deleteWorkplace(@PathVariable Long workplaceId){
        this.workplaceService.deleteWorkplace(workplaceId);
        return ResponseEntity.ok("Workplace deleted with this id : "+workplaceId);
    }

    @PutMapping("/{workplaceId}")
    public ResponseEntity<WorkplaceResponse> updateWorkplace(@PathVariable Long workplaceId , @Valid @RequestBody WorkplaceUpdateRequest request){
        return new ResponseEntity<>(this.workplaceService.updateWorkplace(workplaceId,request),HttpStatus.OK);
    }
}